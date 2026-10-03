-- ==============================================================================
-- Ambros Studio — Phase 2 Supabase Security Migration
-- Migration File: supabase/migrations/20261003_phase2_admin_security.sql
-- Purpose:
--   1. Explicit Admin Authorization via public.admin_users
--   2. Hardened is_admin() and is_super_admin() SECURITY DEFINER functions
--   3. Complete Row Level Security (RLS) on private customers table (Admin-Only)
--   4. Prevent privilege escalation and self-promotion
--   5. Zero public read access on private customer records
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create table: public.admin_users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance authentication lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_lookup 
ON public.admin_users (id, is_active);

-- Auto-update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_admin_users_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_admin_users_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Hardened SECURITY DEFINER Helper Functions
-- ------------------------------------------------------------------------------

-- Function 2A: is_admin()
-- Verifies whether the current authenticated caller is an active administrator.
-- Uses fixed search_path to prevent search_path hijacking attacks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
          AND is_active = TRUE
    );
$$;

-- Function 2B: is_super_admin()
-- Verifies whether the caller is an active super administrator.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
          AND role = 'super_admin'
          AND is_active = TRUE
    );
$$;

-- Revoke default public execution privileges and restrict to authenticated users
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ------------------------------------------------------------------------------
-- 3. Row Level Security on public.admin_users
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_users FROM PUBLIC;
REVOKE ALL ON TABLE public.admin_users FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_users TO authenticated;

-- Dynamically drop all existing policies on public.admin_users before creating admin policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'admin_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.policyname);
    END LOOP;
END
$$;

-- Policy 3A: Any active administrator can inspect their OWN record
CREATE POLICY "Admins can view their own record"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
    id = auth.uid() 
    AND is_active = TRUE
);

-- Policy 3B: Super administrators can view all administrator records
CREATE POLICY "Super admins can view all admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
    public.is_super_admin()
);

-- Policy 3C: Super administrators can insert, update, or remove administrators
-- Prevents regular users or ordinary admins from promoting accounts
CREATE POLICY "Super admins can modify admin_users"
ON public.admin_users
FOR ALL
TO authenticated
USING (
    public.is_super_admin()
)
WITH CHECK (
    public.is_super_admin()
);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security on public.customers (Admin-Only Access)
-- ------------------------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Dynamically drop all existing policies on public.customers before creating the admin policy.
-- Querying pg_policies prevents unpredicted permissive policies from leaving read/write holes.
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'customers'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.customers', pol.policyname);
    END LOOP;
END
$$;

-- Explicit Admin-Only Policy:
-- Strictly restricts SELECT, INSERT, UPDATE, and DELETE to verified administrators.
-- Unauthenticated users and generic authenticated accounts CANNOT access customer records.
CREATE POLICY "Admins have full access to customers"
ON public.customers
FOR ALL
TO authenticated
USING (
    public.is_admin()
)
WITH CHECK (
    public.is_admin()
);

-- Note on Public Digital Card Profiles:
-- In accordance with Ambros Studio security standards, NO public SELECT policy
-- is placed on the private customers table. Public digital business cards will
-- be served via an explicit, field-whitelisted public endpoint or public-safe table.

-- ------------------------------------------------------------------------------
-- 5. Safe, Idempotent First Super Admin Bootstrap Process
-- ------------------------------------------------------------------------------
-- Instructions for the Ambros Studio team:
-- 1. Ensure the administrator account exists in auth.users (via Supabase Auth / Dashboard invite).
-- 2. Configure the owner email variable v_admin_email below (configured: 'ambrosstudioltd@gmail.com').
-- 3. If no matching account is found in auth.users, this block raises a clear SQL EXCEPTION,
--    halting the migration to prevent lockout or inconsistent states.
-- 4. Idempotent: If the administrator already exists in admin_users, it safely ensures
--    the account has the super_admin role and is_active = TRUE without duplicate errors.
-- 5. RLS is NOT weakened: bootstrap executes within migration transaction without public bypasses.
DO $$
DECLARE
    v_admin_email CONSTANT TEXT := 'ambrosstudioltd@gmail.com'; -- Explicitly configured Ambros Studio owner/admin email
    v_user_id UUID;
    v_user_email TEXT;
BEGIN
    -- Verify that the matching auth.users account exists
    SELECT id, email INTO v_user_id, v_user_email
    FROM auth.users
    WHERE LOWER(email) = LOWER(v_admin_email)
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Bootstrap failed: No user account found in auth.users for email "%". Please create/invite the Ambros Studio administrator account in Supabase Auth before running this migration.', v_admin_email;
    END IF;

    -- Safely and idempotently enroll or update the initial super admin
    INSERT INTO public.admin_users (id, email, full_name, role, is_active)
    VALUES (
        v_user_id,
        v_user_email,
        'Ambros Studio Administrator',
        'super_admin',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        is_active = TRUE,
        updated_at = NOW();

    RAISE NOTICE 'Successfully bootstrapped Ambros Studio super admin for "%" (User ID: %).', v_user_email, v_user_id;
END
$$;
-- ==============================================================================

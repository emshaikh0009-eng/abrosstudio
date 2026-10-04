-- ==============================================================================
-- Ambros Studio — Hardened Public Customer Digital Business Card RPC Function
-- Migration: supabase/migrations/20261004_public_customer_card_rpc.sql
-- Status: UNEXECUTED (Pending explicit team review and approval)
-- Purpose:
--   1. Zero table-level SELECT granted to anon on public.customers.
--   2. Strict column whitelisting (13 approved public fields only).
--   3. Exact-one match rule: returns profile ONLY if exactly 1 active record matches.
--   4. If multiple active records match, fails closed (0 rows) and logs an internal warning.
--   5. Hardened with SET search_path = '' and fully qualified object references.
--   6. Atomic unique index on lower(btrim(profile_slug)) for collision prevention.
-- ==============================================================================

-- 1. Atomic Unique Index matching the exact RPC normalization rule
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_profile_slug_lower 
ON public.customers (pg_catalog.lower(pg_catalog.btrim(profile_slug)))
WHERE profile_slug IS NOT NULL;

-- 2. Hardened Public RPC Function
CREATE OR REPLACE FUNCTION public.get_public_card(p_slug TEXT)
RETURNS TABLE (
    full_name TEXT,
    designation TEXT,
    company_name TEXT,
    description TEXT,
    mobile_number TEXT,
    whatsapp_number TEXT,
    email TEXT,
    website TEXT,
    business_address TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    card_design TEXT,
    profile_slug TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_normalized_slug TEXT;
    v_active_count INTEGER;
BEGIN
    -- Return immediately if parameter is NULL
    IF p_slug IS NULL THEN
        RETURN;
    END IF;

    -- Normalize input using identical rules to the unique index
    v_normalized_slug := pg_catalog.lower(pg_catalog.btrim(p_slug));

    -- Return immediately if normalized slug is empty
    IF v_normalized_slug = '' THEN
        RETURN;
    END IF;

    -- Count active records matching this exact normalized slug
    SELECT pg_catalog.count(*)
    INTO v_active_count
    FROM public.customers c
    WHERE pg_catalog.lower(pg_catalog.btrim(c.profile_slug)) = v_normalized_slug
      AND c.is_active = TRUE;

    -- Fail-closed on ambiguity: If duplicates exist, return 0 rows and log warning
    IF v_active_count > 1 THEN
        RAISE WARNING 'Ambiguous public card request: % active records match profile_slug "%"', 
            v_active_count, v_normalized_slug;
        RETURN;
    END IF;

    -- Return profile only when exactly one active customer matches
    IF v_active_count = 1 THEN
        RETURN QUERY
        SELECT 
            c.full_name,
            c.designation,
            c.company_name,
            c.description,
            c.mobile_number,
            c.whatsapp_number,
            c.email,
            c.website,
            c.business_address,
            c.instagram_url,
            c.linkedin_url,
            c.card_design,
            c.profile_slug
        FROM public.customers c
        WHERE pg_catalog.lower(pg_catalog.btrim(c.profile_slug)) = v_normalized_slug
          AND c.is_active = TRUE
        LIMIT 1;
    END IF;

    -- If v_active_count = 0, implicitly returns 0 rows
    RETURN;
END;
$$;

-- 3. Strict Execution Permissions: Revoke default public rights and grant to anon & authenticated
REVOKE ALL ON FUNCTION public.get_public_card(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_card(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.get_public_card(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_card(TEXT) TO anon, authenticated;

-- 4. Documentation Comment
COMMENT ON FUNCTION public.get_public_card(TEXT) IS 
'Hardened public RPC for retrieving whitelisted profile fields for active digital business cards with exact-one matching and hardened search_path.';

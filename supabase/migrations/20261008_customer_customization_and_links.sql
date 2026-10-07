-- ==============================================================================
-- Ambros Studio — Phase 2 Step 1 Customer Customization & Links Schema
-- Migration File: supabase/migrations/20261008_customer_customization_and_links.sql
-- Purpose:
--   1. Add custom_settings JSONB column to public.customers to persist:
--      - Card appearance (primaryColor, backgroundColor, textColor, fontFamily)
--      - Ordered links & social contacts (type, label, value, enabled, order)
--   2. Update hardened SECURITY DEFINER function public.get_public_card(p_slug TEXT)
--      to include custom_settings JSONB in the whitelisted output signature.
--   3. Strict least-privilege security model preserved:
--      - SECURITY DEFINER with SET search_path = ''
--      - Fail-closed behavior for unknown / inactive / ambiguous customers
--      - Zero table-level SELECT for public/anon on public.customers
--
-- JSONB Schema Specification:
--   {
--     "appearance": {
--       "primaryColor": "#10b981",       -- Optional hex color or empty string
--       "backgroundColor": "#faf6ee",    -- Optional hex color or empty string
--       "textColor": "#1e293b",          -- Optional hex color or empty string
--       "fontFamily": "Inter"            -- Optional font name (Inter, Poppins, etc.)
--     },
--     "links": [
--       {
--         "id": "link_1",                -- Unique identifier
--         "type": "whatsapp",            -- 'whatsapp' | 'phone' | 'email' | 'website' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'twitter' | 'telegram' | 'maps' | 'custom'
--         "label": "Chat on WhatsApp",   -- Friendly display title
--         "value": "+91 9157778915",     -- URL, username, or phone number
--         "enabled": true,               -- Boolean toggle
--         "order": 0                     -- Integer display index
--       }
--     ]
--   }
-- ==============================================================================

-- 1. Safely add custom_settings column to public.customers if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'customers' 
          AND column_name = 'custom_settings'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN custom_settings JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added custom_settings JSONB column to public.customers table.';
    ELSE
        RAISE NOTICE 'custom_settings column already exists on public.customers table.';
    END IF;
END $$;

-- 2. Update Hardened Public RPC Function with custom_settings JSONB
-- Note: In PostgreSQL, altering the return type requires dropping the existing definition.
DROP FUNCTION IF EXISTS public.get_public_card(TEXT);

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
    profile_slug TEXT,
    avatar_url TEXT,
    custom_settings JSONB
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

    -- Normalize input using lowercase and trimmed whitespace
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

    -- Fail-closed on ambiguity: If multiple active records match exact slug, return 0 rows
    IF v_active_count > 1 THEN
        RAISE WARNING 'Ambiguous public card request: % active records match profile_slug "%"', 
            v_active_count, v_normalized_slug;
        RETURN;
    END IF;

    -- Return profile when exactly one active customer matches exact slug
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
            c.profile_slug,
            c.avatar_url,
            c.custom_settings
        FROM public.customers c
        WHERE pg_catalog.lower(pg_catalog.btrim(c.profile_slug)) = v_normalized_slug
          AND c.is_active = TRUE
        LIMIT 1;
        RETURN;
    END IF;

    -- Fallback: If 0 exact matches, check safe brand alias (e.g. 'ambros' <-> 'ambros-studio')
    SELECT pg_catalog.count(*)
    INTO v_active_count
    FROM public.customers c
    WHERE (
        (v_normalized_slug = 'ambros' AND pg_catalog.lower(pg_catalog.btrim(c.profile_slug)) = 'ambros-studio')
        OR
        (v_normalized_slug = 'ambros-studio' AND pg_catalog.lower(pg_catalog.btrim(c.profile_slug)) = 'ambros')
    )
    AND c.is_active = TRUE;

    -- Return profile if exactly one active customer matches the alias
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
            c.profile_slug,
            c.avatar_url,
            c.custom_settings
        FROM public.customers c
        WHERE (
            (v_normalized_slug = 'ambros' AND pg_catalog.lower(pg_catalog.btrim(c.profile_slug)) = 'ambros-studio')
            OR
            (v_normalized_slug = 'ambros-studio' AND pg_catalog.lower(pg_catalog.btrim(c.profile_slug)) = 'ambros')
        )
        AND c.is_active = TRUE
        LIMIT 1;
    END IF;

    -- If no match found, implicitly returns 0 rows
    RETURN;
END;
$$;

-- 3. Strict Execution Permissions
REVOKE ALL ON FUNCTION public.get_public_card(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_card(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.get_public_card(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_card(TEXT) TO anon, authenticated;

-- 4. Documentation Comment
COMMENT ON FUNCTION public.get_public_card(TEXT) IS 
'Hardened public RPC for retrieving whitelisted profile fields (including avatar_url and custom_settings JSONB) for active digital business cards with exact-one matching and hardened search_path.';

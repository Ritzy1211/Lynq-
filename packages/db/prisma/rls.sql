-- =============================================================================
-- Lynq — Postgres Row-Level Security policies.
--
-- This migration runs AFTER the base Prisma migration that creates the tables.
-- Apply with `pnpm db:migrate` once the base schema migration exists, or run
-- this file manually in production.
--
-- The API sets `app.current_tenant` on every transaction via:
--   SELECT set_config('app.current_tenant', '<uuid>', true);
-- and policies compare every row's `tenant_id` against that GUC.
--
-- A separate `app_role` is used for application traffic so that policies are
-- enforced; migrations and admin tooling continue to use the superuser role.
-- =============================================================================

-- Helper: read the current tenant from the per-transaction GUC.
CREATE OR REPLACE FUNCTION app_current_tenant()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_tenant', true), '')::uuid;
$$;

-- Apply RLS to every tenant-scoped table.
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'branches',
    'users',
    'customers',
    'service_types',
    'garment_types',
    'price_rules',
    'orders',
    'order_items',
    'order_status_events',
    'payments',
    'inventory_items',
    'stock_movements',
    'promo_codes',
    'notification_logs',
    'audit_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);

    EXECUTE format($p$
      DROP POLICY IF EXISTS tenant_isolation ON %I;
      CREATE POLICY tenant_isolation ON %I
        USING ("tenantId" = app_current_tenant())
        WITH CHECK ("tenantId" = app_current_tenant());
    $p$, tbl, tbl);
  END LOOP;
END;
$$;

-- The `tenants` table itself is global; restrict to rows matching the GUC so
-- the API can only "see" its own tenant row.
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_self ON tenants;
CREATE POLICY tenant_self ON tenants
  USING (id = app_current_tenant())
  WITH CHECK (id = app_current_tenant());

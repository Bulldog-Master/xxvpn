-- Phase 2: Hierarchical Admin Roles - Add super_admin role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
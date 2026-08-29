-- ============================================================
-- THEMIA LEGAL — Fase 4: casos / asuntos jurídicos
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabla de casos.
--    Un CASE es el asunto general de la clienta. NO asume que sea un
--    proceso judicial formal — puede ser una simple consulta. Cuando
--    sí exista un proceso formal, eso vive en una tabla PROCEEDINGS
--    aparte (Fase 5), ligada a este caso.
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  responsible_lawyer_id uuid references auth.users (id) on delete set null,
  area text not null check (area in (
    'FAMILIA', 'CIVIL', 'LABORAL', 'COMERCIAL_EMPRESARIAL',
    'CONSTITUCIONAL', 'PENAL', 'SERVICIOS_JURIDICOS'
  )),
  case_type text not null default 'CONSULTA' check (case_type in (
    'CONSULTA', 'ASUNTO_EXTRAJUDICIAL', 'PROCESO_JUDICIAL',
    'TRAMITE_ADMINISTRATIVO', 'CONCILIACION', 'CONTRATO', 'OTRO'
  )),
  title text not null,
  description text,
  client_objective text,
  priority text not null default 'MEDIA'
    check (priority in ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
  status text not null default 'LEAD' check (status in (
    'LEAD', 'CONSULTATION', 'ANALYSIS', 'ACTIVE', 'WAITING_CLIENT',
    'WAITING_AUTHORITY', 'HEARING_SCHEDULED', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cases is
  'Asunto jurídico general de la clienta. No implica necesariamente un proceso judicial formal.';

-- 2) Seguridad: activar RLS.
alter table public.cases enable row level security;

-- El equipo ve, crea y actualiza casos.
create policy "cases_select_staff"
  on public.cases for select
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

create policy "cases_insert_staff"
  on public.cases for insert
  with check (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

create policy "cases_update_staff"
  on public.cases for update
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

-- Una clienta solo ve SUS casos (vinculados a su client_id, que a su
-- vez está vinculado a su user_id de acceso).
create policy "cases_select_own"
  on public.cases for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = cases.client_id and c.user_id = auth.uid()
    )
  );

-- 3) Permisos base (igual que en las fases anteriores).
grant select, insert, update on public.cases to authenticated;

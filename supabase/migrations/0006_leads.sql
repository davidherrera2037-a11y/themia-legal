-- ============================================================
-- THEMIA LEGAL — Fase 6: solicitudes del sitio público
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================
--
-- Hasta ahora el formulario "Cuéntanos tu caso" solo abría WhatsApp con un
-- texto ya escrito. Si la persona no pulsaba enviar en WhatsApp, o lo hacía
-- a las 2 de la mañana y el mensaje se perdía entre otros, ese contacto no
-- quedaba en ninguna parte. Esta tabla guarda la solicitud antes de abrir
-- WhatsApp, así que el contacto existe aunque la conversación no ocurra.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  area text not null check (length(area) <= 80),
  message text check (length(message) <= 2000),
  phone text check (length(phone) <= 40),
  email text check (length(email) <= 160),
  -- Por dónde llegó. Hoy siempre 'WEB'; queda abierto para cuando haya
  -- campañas o referidos y se quiera saber qué canal trae casos.
  source text not null default 'WEB' check (source in ('WEB', 'WHATSAPP', 'REFERIDO', 'OTRO')),
  status text not null default 'NUEVA' check (status in (
    'NUEVA', 'CONTACTADA', 'AGENDADA', 'CONVERTIDA', 'DESCARTADA'
  )),
  -- Cuando la solicitud se convierte en clienta, se deja el vínculo para
  -- no perder de dónde salió el caso.
  client_id uuid references public.clients (id) on delete set null,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leads is
  'Solicitudes enviadas desde el formulario público. Nadie sin sesión puede leerlas.';

create index if not exists leads_status_idx on public.leads (status, created_at desc);
create index if not exists leads_client_idx on public.leads (client_id);

drop trigger if exists tocar_updated_at on public.leads;
create trigger tocar_updated_at before update on public.leads
  for each row execute function public.tocar_updated_at();

alter table public.leads enable row level security;

-- Quien visita el sitio puede DEJAR una solicitud y nada más. No hay
-- política de select para anon, así que no puede leer ni la suya propia
-- ni las de nadie: el formulario escribe y se olvida.
drop policy if exists "leads_insert_publico" on public.leads;
create policy "leads_insert_publico"
  on public.leads for insert
  to anon, authenticated
  with check (
    status = 'NUEVA'
    and source = 'WEB'
    and client_id is null
    and internal_note is null
  );

-- El `to authenticated` de estas dos no es decorativo. Sin él la política
-- aplica al rol `public`, que incluye a quien no ha entrado, y entonces
-- Postgres evalúa `get_my_role()` también para un visitante — al que la
-- migración 0005 le quitó el permiso sobre esa función. El visitante no
-- vería las solicitudes de nadie (eso funciona igual), pero recibiría un
-- error de permisos en vez de nada, y bastaría con que la inserción del
-- formulario pidiera de vuelta la fila creada para que dejara de guardar.
-- Es la única tabla que un visitante puede tocar, así que es la única
-- donde esto importa.
drop policy if exists "leads_select_staff" on public.leads;
create policy "leads_select_staff"
  on public.leads for select
  to authenticated
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

drop policy if exists "leads_update_staff" on public.leads;
create policy "leads_update_staff"
  on public.leads for update
  to authenticated
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

-- anon solo recibe insert. Sin select, sin update, sin delete.
grant insert on public.leads to anon;
grant select, insert, update on public.leads to authenticated;

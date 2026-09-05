-- ============================================================
-- THEMIA LEGAL — Fase 7: expediente del caso (actuaciones y notas)
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================
--
-- Un caso hasta ahora era una fila con un estado. Lo que hace falta para
-- trabajarlo de verdad es la historia: qué se hizo, cuándo, y qué de eso
-- puede ver la clienta.
--
-- La columna `visible_para_cliente` es la pieza importante. Un mismo
-- expediente tiene dos lecturas: la interna (estrategia, honorarios, lo
-- que se piensa y no se dice) y la que la clienta puede leer en su portal.
-- Que sean la misma tabla con una marca, y no dos tablas, evita el error
-- clásico de escribir la nota en el lugar equivocado.

create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  -- Quién lo escribió. Se conserva la fila aunque la cuenta se borre: el
  -- expediente no puede perder actuaciones porque alguien salió del equipo.
  author_id uuid references auth.users (id) on delete set null,
  author_name text,
  kind text not null default 'NOTA' check (kind in (
    'NOTA',              -- apunte libre
    'ACTUACION',         -- se hizo algo en el proceso
    'CAMBIO_ESTADO',     -- lo escribe el sistema al mover el caso
    'AUDIENCIA',
    'DOCUMENTO',
    'COMUNICACION'       -- llamada, correo, WhatsApp con la clienta
  )),
  title text not null check (length(trim(title)) between 2 and 200),
  detail text check (length(detail) <= 5000),
  -- Fecha del hecho, que no siempre es la de captura: una audiencia se
  -- registra el lunes aunque ocurrió el viernes.
  occurred_at timestamptz not null default now(),
  visible_para_cliente boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.case_events is
  'Línea de tiempo del caso. visible_para_cliente decide si la clienta lo ve en su portal.';

comment on column public.case_events.visible_para_cliente is
  'false = solo el equipo. true = aparece también en el portal de la clienta.';

create index if not exists case_events_case_idx
  on public.case_events (case_id, occurred_at desc);

create index if not exists case_events_author_idx
  on public.case_events (author_id);

alter table public.case_events enable row level security;

-- El equipo ve y escribe todo.
drop policy if exists "case_events_select_staff" on public.case_events;
create policy "case_events_select_staff"
  on public.case_events for select
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

drop policy if exists "case_events_insert_staff" on public.case_events;
create policy "case_events_insert_staff"
  on public.case_events for insert
  with check (
    public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA')
    -- Nadie firma con el nombre de otra persona.
    and author_id = auth.uid()
  );

drop policy if exists "case_events_update_staff" on public.case_events;
create policy "case_events_update_staff"
  on public.case_events for update
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

-- La clienta ve únicamente lo marcado como visible, y solo de SUS casos.
-- Las dos condiciones importan: sin la primera vería la estrategia interna;
-- sin la segunda vería los expedientes de otras personas.
drop policy if exists "case_events_select_own" on public.case_events;
create policy "case_events_select_own"
  on public.case_events for select
  using (
    visible_para_cliente
    and exists (
      select 1
      from public.cases ca
      join public.clients cl on cl.id = ca.client_id
      where ca.id = case_events.case_id and cl.user_id = auth.uid()
    )
  );

grant select, insert, update on public.case_events to authenticated;


-- ------------------------------------------------------------
-- Registro automático de los cambios de estado
-- ------------------------------------------------------------
-- Si el estado se mueve desde el portal, la actuación la escribe la
-- pantalla. Pero si alguien lo mueve desde el Table Editor de Supabase, el
-- expediente se quedaría con un salto sin explicación. Este trigger cubre
-- los dos casos.
create or replace function public.registrar_cambio_de_estado()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.case_events (
      case_id, author_id, kind, title, visible_para_cliente
    ) values (
      new.id,
      auth.uid(),
      'CAMBIO_ESTADO',
      format('Estado: %s → %s', old.status, new.status),
      -- Que la clienta vea el avance sin tener que preguntarlo es media
      -- razón de ser del portal.
      true
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.registrar_cambio_de_estado() from public, anon, authenticated;

drop trigger if exists registrar_cambio_de_estado on public.cases;
create trigger registrar_cambio_de_estado
  after update on public.cases
  for each row execute function public.registrar_cambio_de_estado();

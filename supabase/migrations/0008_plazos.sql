-- ============================================================
-- THEMIA LEGAL — Fase 8: plazos y términos judiciales
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================
--
-- Un caso sin control de términos es un caso a la espera de un problema.
-- Esta tabla guarda lo que vence: términos procesales, audiencias,
-- reuniones y pagos.
--
-- La fecha de vencimiento se guarda ya calculada (`due_date`) y aparte se
-- conserva de dónde salió (`base_date` + `business_days`). Guardar solo la
-- fórmula obligaría a recalcularla en cada consulta y a que la base
-- conociera el calendario de festivos; guardar solo el resultado dejaría
-- sin explicación de por qué vence ese día. Con las dos cosas, la
-- pantalla puede mostrar "3 días hábiles desde el 4 de septiembre" y
-- ordenar por fecha sin hacer cuentas.

create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,

  title text not null check (length(trim(title)) between 2 and 200),
  kind text not null default 'TERMINO' check (kind in (
    'TERMINO',    -- término procesal: se cuenta en días hábiles
    'AUDIENCIA',
    'REUNION',
    'PAGO',
    'OTRO'
  )),

  -- El día en que vence. Es `date` y no `timestamptz` a propósito: un
  -- término vence un día completo, y guardarlo con hora invita a que un
  -- huso horario lo desplace al día anterior.
  due_date date not null,

  -- Cómo se llegó a esa fecha. Ambas nulas cuando se puso a mano.
  base_date date,
  business_days integer check (business_days is null or business_days between 1 and 365),

  status text not null default 'PENDIENTE' check (status in (
    'PENDIENTE', 'CUMPLIDO', 'CANCELADO'
  )),
  completed_at timestamptz,
  completed_by uuid references auth.users (id) on delete set null,

  notes text check (notes is null or length(notes) <= 2000),
  -- Una audiencia sí le interesa a la clienta; el término para contestar
  -- un traslado, normalmente no. Por eso se decide plazo a plazo, y por
  -- defecto es privado.
  visible_para_cliente boolean not null default false,

  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.deadlines is
  'Lo que vence en un caso: términos, audiencias, reuniones y pagos.';
comment on column public.deadlines.due_date is
  'Día de vencimiento ya calculado. Se ordena y se filtra por esta columna.';
comment on column public.deadlines.base_date is
  'Fecha desde la que se contó, cuando el plazo se calculó en días hábiles.';

create index if not exists deadlines_case_idx on public.deadlines (case_id);
create index if not exists deadlines_pendientes_idx
  on public.deadlines (due_date) where status = 'PENDIENTE';
create index if not exists deadlines_created_by_idx on public.deadlines (created_by);
create index if not exists deadlines_completed_by_idx on public.deadlines (completed_by);

drop trigger if exists tocar_updated_at on public.deadlines;
create trigger tocar_updated_at before update on public.deadlines
  for each row execute function public.tocar_updated_at();

alter table public.deadlines enable row level security;

-- El equipo ve y gestiona todos los plazos.
drop policy if exists "deadlines_select_staff" on public.deadlines;
create policy "deadlines_select_staff"
  on public.deadlines for select
  to authenticated
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

drop policy if exists "deadlines_insert_staff" on public.deadlines;
create policy "deadlines_insert_staff"
  on public.deadlines for insert
  to authenticated
  with check (
    public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA')
    -- Nadie apunta un plazo a nombre de otra persona.
    and created_by = auth.uid()
  );

drop policy if exists "deadlines_update_staff" on public.deadlines;
create policy "deadlines_update_staff"
  on public.deadlines for update
  to authenticated
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

-- La clienta ve solo lo marcado como visible, y solo de SUS casos. Las dos
-- condiciones importan: sin la primera vería la estrategia procesal; sin
-- la segunda, los plazos de otras personas.
drop policy if exists "deadlines_select_own" on public.deadlines;
create policy "deadlines_select_own"
  on public.deadlines for select
  to authenticated
  using (
    visible_para_cliente
    and exists (
      select 1
      from public.cases ca
      join public.clients cl on cl.id = ca.client_id
      where ca.id = deadlines.case_id and cl.user_id = auth.uid()
    )
  );

grant select, insert, update on public.deadlines to authenticated;


-- ------------------------------------------------------------
-- El plazo deja rastro en la línea de tiempo
-- ------------------------------------------------------------
-- Sin esto, el expediente contaría lo que se hizo pero no lo que estaba
-- por hacer, y al revisar un caso cerrado no habría forma de saber si una
-- audiencia se atendió o se dejó pasar.
create or replace function public.registrar_plazo()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  quien text;
begin
  select coalesce(full_name, email) into quien
  from public.profiles where id = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.case_events (
      case_id, author_id, author_name, kind, title, detail,
      occurred_at, visible_para_cliente
    ) values (
      new.case_id, auth.uid(), quien,
      case when new.kind = 'AUDIENCIA' then 'AUDIENCIA' else 'ACTUACION' end,
      format('Plazo registrado: %s', new.title),
      format('Vence el %s.', to_char(new.due_date, 'DD/MM/YYYY')),
      now(), new.visible_para_cliente
    );
    return new;
  end if;

  -- Solo el cierre; editar el título de un plazo no es una actuación.
  if new.status is distinct from old.status and new.status <> 'PENDIENTE' then
    insert into public.case_events (
      case_id, author_id, author_name, kind, title, detail,
      occurred_at, visible_para_cliente
    ) values (
      new.case_id, auth.uid(), quien, 'ACTUACION',
      format(
        '%s: %s',
        case when new.status = 'CUMPLIDO' then 'Plazo cumplido' else 'Plazo cancelado' end,
        new.title
      ),
      format('Vencía el %s.', to_char(new.due_date, 'DD/MM/YYYY')),
      now(), new.visible_para_cliente
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.registrar_plazo() from public, anon, authenticated;

drop trigger if exists registrar_plazo_alta on public.deadlines;
create trigger registrar_plazo_alta
  after insert on public.deadlines
  for each row execute function public.registrar_plazo();

drop trigger if exists registrar_plazo_cierre on public.deadlines;
create trigger registrar_plazo_cierre
  after update on public.deadlines
  for each row execute function public.registrar_plazo();

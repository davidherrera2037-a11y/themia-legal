-- ============================================================
-- THEMIA LEGAL — Fase 4b: vincular clientes con su cuenta de acceso
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Guardar el correo en profiles — lo necesitamos para poder
--    identificar cuentas de acceso al vincularlas con un cliente.
alter table public.profiles add column if not exists email text;

-- 2) Que el trigger de usuarios nuevos también guarde el correo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

-- 3) Rellenar el correo de las cuentas que ya existían antes de esto
--    (tú y las abogadas que ya creaste).
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

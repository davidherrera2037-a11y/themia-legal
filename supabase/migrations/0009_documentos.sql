-- ============================================================
-- THEMIA LEGAL — Fase 9: documentos del expediente
-- Cópialo completo y pégalo en Supabase → SQL Editor → New query → Run
-- ============================================================
--
-- Los archivos van a Supabase Storage y sus datos a esta tabla. Son dos
-- cosas separadas a propósito: Storage guarda bytes y no entiende de
-- casos ni de quién puede ver qué, así que la visibilidad vive aquí y las
-- políticas del bucket la consultan.

-- 1) Bucket privado. `public = false` es lo que impide que baste con
--    adivinar la URL: cada descarga necesita un enlace firmado que caduca.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expedientes', 'expedientes', false,
  20971520, -- 20 MB: una demanda escaneada cabe; un vídeo, no.
  array[
    'application/pdf',
    'image/jpeg','image/png','image/webp','image/heic',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) Los datos del documento.
create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,

  -- Ruta dentro del bucket: '<case_id>/<uuid>-<nombre>'. Única porque es
  -- la llave con la que las políticas de Storage encuentran esta fila.
  storage_path text not null unique,
  file_name text not null check (length(trim(file_name)) between 1 and 255),
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),

  kind text not null default 'OTRO' check (kind in (
    'DEMANDA', 'CONTESTACION', 'PODER', 'PRUEBA', 'PROVIDENCIA',
    'CONTRATO', 'IDENTIFICACION', 'OTRO'
  )),
  description text check (description is null or length(description) <= 1000),

  -- Igual que las actuaciones y los plazos: nace privado.
  visible_para_cliente boolean not null default false,

  uploaded_by uuid references auth.users (id) on delete set null,
  uploaded_by_name text,
  created_at timestamptz not null default now()
);

comment on table public.case_documents is
  'Datos de los archivos del expediente. Los bytes están en el bucket privado "expedientes".';
comment on column public.case_documents.storage_path is
  'Ruta en el bucket. Es la llave por la que las políticas de Storage deciden quién puede descargar.';

create index if not exists case_documents_case_idx
  on public.case_documents (case_id, created_at desc);
create index if not exists case_documents_uploader_idx
  on public.case_documents (uploaded_by);

alter table public.case_documents enable row level security;

drop policy if exists "case_documents_select_staff" on public.case_documents;
create policy "case_documents_select_staff"
  on public.case_documents for select to authenticated
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

drop policy if exists "case_documents_insert_staff" on public.case_documents;
create policy "case_documents_insert_staff"
  on public.case_documents for insert to authenticated
  with check (
    public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA')
    and uploaded_by = auth.uid()
  );

drop policy if exists "case_documents_update_staff" on public.case_documents;
create policy "case_documents_update_staff"
  on public.case_documents for update to authenticated
  using (public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA'));

-- La clienta ve solo lo compartido, y solo de SUS casos.
drop policy if exists "case_documents_select_own" on public.case_documents;
create policy "case_documents_select_own"
  on public.case_documents for select to authenticated
  using (
    visible_para_cliente
    and exists (
      select 1 from public.cases ca
      join public.clients cl on cl.id = ca.client_id
      where ca.id = case_documents.case_id and cl.user_id = auth.uid()
    )
  );

grant select, insert, update on public.case_documents to authenticated;

-- 3) Quién puede tocar los bytes.
--    El equipo, todo. La clienta, solo los archivos cuya fila está
--    marcada como visible y cuelga de un caso suyo: la condición se
--    resuelve contra case_documents, que es donde vive esa decisión.
drop policy if exists "expedientes_todo_staff" on storage.objects;
create policy "expedientes_todo_staff"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'expedientes'
    and public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA')
  )
  with check (
    bucket_id = 'expedientes'
    and public.get_my_role() in ('SUPER_ADMIN', 'ADMINISTRATIVA', 'ABOGADA')
  );

drop policy if exists "expedientes_lectura_cliente" on storage.objects;
create policy "expedientes_lectura_cliente"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'expedientes'
    and exists (
      select 1
      from public.case_documents d
      join public.cases ca on ca.id = d.case_id
      join public.clients cl on cl.id = ca.client_id
      where d.storage_path = storage.objects.name
        and d.visible_para_cliente
        and cl.user_id = auth.uid()
    )
  );

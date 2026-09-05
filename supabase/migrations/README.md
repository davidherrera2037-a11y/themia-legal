# Migraciones

Cada archivo es un paso de la base de datos, en orden. Se aplican **una
sola vez y en orden numérico**: Supabase → SQL Editor → New query → pegar
el contenido completo → Run.

| Archivo | Qué hace |
| --- | --- |
| `0001_auth_roles.sql` | Perfiles, roles y RLS inicial |
| `0002_clients.sql` | Clientas |
| `0003_cases.sql` | Casos / asuntos jurídicos |
| `0004_link_clients.sql` | Correo en el perfil y vínculo cuenta ↔ clienta |
| `0005_endurecer_seguridad.sql` | Cierra la escalada de rol, `updated_at`, bitácora, índices |
| `0006_leads.sql` | Solicitudes del formulario público |
| `0007_case_events.sql` | Línea de tiempo del expediente |

Todas están escritas para poder correrse dos veces sin romper nada
(`create ... if not exists`, `drop policy if exists`). Si tienes dudas de
si ya aplicaste una, aplicarla de nuevo es seguro.

## Después de aplicar 0005

`0005` bloquea que alguien cambie su propio rol. La primera SUPER_ADMIN
tiene que nombrarse desde la consola SQL, que es el único camino que el
bloqueo deja abierto a propósito:

```sql
update public.profiles set role = 'SUPER_ADMIN'
where email = 'correo.de.la.socia@ejemplo.com';
```

Desde ahí, esa cuenta ya puede administrar los roles del resto del equipo
desde el portal, en **Portal → Equipo → Administración**.

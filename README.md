# Themia Legal — sitio web y portal del despacho

Dos cosas en un mismo proyecto:

1. **La web pública** (`/`): la carta de presentación del despacho y el
   formulario por el que llega el trabajo nuevo.
2. **El portal privado** (`/portal`): donde el equipo lleva las clientas,
   los casos y sus actuaciones, y donde cada clienta puede ver en qué va lo
   suyo sin tener que llamar a preguntar.

Next.js 16 · TypeScript · Tailwind 4 · Supabase (Postgres + Auth + RLS).

---

## 1. Cómo está organizado

```
app/
  (public)/page.tsx     La portada. Estática: se pregenera y se sirve rápido.
  login/                Entrada al portal. Se renderiza en cada petición.
  portal/
    layout.tsx          Barra de navegación común y reparto por rol.
    cliente/            Lo que ve la clienta: sus asuntos y su historial.
    equipo/             Tablero, solicitudes, casos, clientas, administración.
  actions/leads.ts      La única acción que corre sin sesión.
  robots.ts sitemap.ts  Para los buscadores.
components/
  ui/                   Botones, tarjetas, campos. Se usan en todo el portal.
  portal/               Piezas del portal (la línea de tiempo).
  *.tsx                 Secciones de la web pública.
lib/
  db/tipos.ts           El vocabulario del dominio: estados, áreas, etiquetas.
  auth/                 Quién eres y qué puedes ver.
  supabase/             Clientes de Supabase (navegador y servidor).
  sitio.ts              Teléfono, correo, redes. Un solo lugar.
  acciones/tipos.ts     Cómo responden las acciones de servidor.
supabase/migrations/    La base de datos, paso a paso. Ver su README.
proxy.ts                Sesión, rutas privadas y política de contenido.
```

### Las dos capas de seguridad

Conviene tener claro esto antes de tocar nada:

- **RLS (Row Level Security), en Postgres.** Es la seguridad de verdad.
  Decide fila por fila quién puede leer y escribir qué. Se cumple aunque
  alguien llame a la API de Supabase directamente, sin pasar por esta web.
- **`requireRole(...)` en el código.** Es comodidad, no seguridad: evita que
  alguien vea una pantalla que de todas formas le llegaría vacía, y le manda
  a su área correcta en vez de a un error.

Si añades una pantalla nueva, la pregunta importante no es "¿puse
`requireRole`?" sino "¿qué política RLS protege esta tabla?".

---

## 2. Roles

| Rol | Qué puede hacer |
| --- | --- |
| `SUPER_ADMIN` | Todo, más administrar cuentas y roles del equipo |
| `ADMINISTRATIVA` | Clientas, casos, solicitudes; vincular cuentas de acceso |
| `ABOGADA` | Clientas, casos, solicitudes y actuaciones |
| `CLIENTE` | Solo sus propios asuntos, y solo lo que se marcó como visible |

Nadie puede cambiarse su propio rol, ni siquiera llamando a la API a mano: lo
impide un trigger en la base (`proteger_rol_y_estado`). La primera
`SUPER_ADMIN` se nombra desde la consola SQL de Supabase — ver
`supabase/migrations/README.md`.

---

## 3. Puesta en marcha

### 3.1 Base de datos

En Supabase → **SQL Editor** → New query, aplica **en orden** cada archivo de
`supabase/migrations/`. Están escritas para poder correrse dos veces sin
romper nada, así que si dudas, aplicarlas otra vez es seguro.

Después de la `0005`, nómbrate SUPER_ADMIN:

```sql
update public.profiles set role = 'SUPER_ADMIN'
where email = 'tu.correo@ejemplo.com';
```

### 3.2 Variables de entorno

Copia `.env.example` a `.env.local` (para trabajar en tu computador) o
cárgalas en Vercel → Settings → Environment Variables:

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Dirección del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública. No da acceso por sí sola: RLS manda |
| `NEXT_PUBLIC_SITE_URL` | Dirección del sitio ya publicado, para el sitemap y las etiquetas al compartir |

Este proyecto **no usa la clave de servicio** (`service_role`) en ninguna
parte. Si algún día alguien la añade, todo lo escrito arriba sobre RLS deja
de valer para ese código.

**¿No aparece el inicio de sesión?** Si faltan las dos primeras variables, la
web pública sigue funcionando pero el portal se desactiva y redirige al
inicio. Para comprobarlo sin abrir el sitio:

```bash
curl -I https://tu-sitio.com | grep x-themia-auth
# x-themia-auth: sin-configurar  → faltan las variables en Vercel
```

### 3.3 En tu computador

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # lo mismo que revisa CI
npm run build
```

---

## 4. Cómo se trabaja un caso

1. Llega una solicitud por el formulario público → aparece en
   **Portal → Solicitudes** (y también se abre WhatsApp, pero ya no depende
   de eso: la solicitud queda guardada aunque nadie escriba).
2. Desde la solicitud, **Crear clienta con estos datos** rellena la ficha sin
   volver a teclear nada.
3. Desde la ficha de la clienta, **Nuevo caso**.
4. En el caso se registran actuaciones. Cada una nace **privada**; marcar
   "Compartir con la clienta" es lo que la hace aparecer en su portal.
5. Al mover el estado del caso, la base escribe sola la actuación
   correspondiente y la clienta lo ve. Eso pasa también si el estado se
   cambia desde la consola de Supabase.

### Lo que la clienta ve y lo que no

Su portal muestra el título del caso, el área, una frase en lenguaje llano
sobre el estado, su objetivo tal como se registró, y **solo** las actuaciones
marcadas como visibles. La descripción interna, las notas de estrategia y
cualquier actuación sin marcar no salen de la base: lo impide la política
`case_events_select_own`, no un `if` en el código.

---

## 5. Despliegue

Vercel, conectado al repositorio. `vercel.json` ya fija el framework y los
comandos. Cada `push` dispara CI (`.github/workflows/ci.yml`), que corre
typecheck, build y una revisión de vulnerabilidades en dependencias.

---

## 6. Seguridad

Está documentada aparte, con lo que ya está puesto y lo que hay que hacer a
mano: **[SEGURIDAD.md](./SEGURIDAD.md)**. Si vas a manejar expedientes
reales, léelo antes.

---

## 7. Imágenes

`public/images/hero.jpg` es la foto principal. Si quieres cambiar el
logotipo dibujado por el archivo real, ponlo en `public/images/logo.png` y
cambia `<LogoMark />` por `<img src="/images/logo.png" ... />` en
`components/Hero.tsx` y `components/Header.tsx`.

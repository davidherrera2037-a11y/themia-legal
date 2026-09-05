# Seguridad y resguardo de la información

Este documento está escrito para que lo entienda quien dirige el despacho,
no solo quien programa. Tiene tres partes:

1. **Lo que ya está puesto** — funciona solo, no hay que hacer nada.
2. **Lo que debe hacer usted** — no lo puede hacer el código.
3. **Lo que sigue pendiente** — se sabe que falta, y por qué.

Un portal de un despacho de abogadas guarda material sensible: documentos de
identidad, direcciones, conflictos familiares, denuncias. En Colombia eso son
**datos personales sensibles** bajo la Ley 1581 de 2012. Vale la pena leer
esto entero.

---

## 1. Lo que ya está puesto

### Quién puede entrar

- El acceso es por correo y contraseña, gestionado por Supabase Auth. Las
  contraseñas nunca pasan por este código ni se guardan en nuestras tablas.
- Todo lo que está bajo `/portal` exige sesión. La comprobación corre en el
  servidor (`proxy.ts`), antes de que se dibuje nada: no es un enlace
  escondido en el menú.
- Una cuenta marcada como **inactiva** queda fuera aunque su sesión siga
  viva: se comprueba en cada carga y se la devuelve al inicio de sesión.
- La pantalla de acceso responde lo mismo ante "ese correo no existe" y ante
  "contraseña incorrecta". Distinguirlos le confirmaría a quien prueba
  correos al azar cuáles pertenecen al despacho.
- El parámetro `?volver=` solo acepta rutas internas. Sin esa comprobación,
  un enlace preparado podría usar la pantalla de entrada del despacho como
  trampolín hacia una copia falsa.

### Quién puede ver qué

La regla se cumple **en la base de datos**, no en el código de las pantallas.
Esto importa: la API de Supabase está abierta al navegador por diseño, así
que cualquiera con una sesión puede llamarla directamente. Lo único que lo
frena son las políticas RLS.

| Tabla | Equipo | Clienta | Quien no ha entrado |
| --- | --- | --- | --- |
| `profiles` | Ve al equipo; SUPER_ADMIN y ADMINISTRATIVA ven también a las clientas | Solo su propio perfil | Nada |
| `clients` | Ve, crea y edita | Solo su propia ficha | Nada |
| `cases` | Ve, crea y edita | Solo los casos ligados a su ficha | Nada |
| `case_events` | Ve y escribe todo | Solo lo marcado como visible, y solo de sus casos | Nada |
| `leads` | Ve y gestiona | — | **Solo puede insertar** |
| `profile_audit` | Solo lectura, solo SUPER_ADMIN | — | Nada |

Ninguna tabla tiene política de borrado. En RLS, lo que no se permite se
niega: nadie puede borrar filas desde la aplicación.

### El agujero que se cerró

Hasta la migración `0005`, la política "cada quien puede editar su propio
perfil" incluía la columna del rol. Es decir: **una clienta con cuenta podía
hacer una sola llamada a la API y quedar como SUPER_ADMIN**, y desde ahí leer
todos los expedientes del despacho. Ninguna otra política lo impedía, porque
todas preguntan "¿cuál es tu rol?" — y el rol ya sería el nuevo.

Ahora lo bloquea un trigger (`proteger_rol_y_estado`), que es el único punto
por el que pasan todas las actualizaciones vengan de donde vengan. Solo una
SUPER_ADMIN puede cambiar el rol de **otra** persona, nunca el suyo.

Si su proyecto ya estaba en producción antes de aplicar `0005`, conviene
revisar la lista de cuentas en **Portal → Equipo** y confirmar que nadie
tiene un rol que no le corresponde.

### La bitácora

Todo cambio de rol o de estado de una cuenta queda registrado en
`profile_audit`: quién era, en qué se convirtió, quién lo hizo y cuándo. La
escribe la base de datos sola, también cuando el cambio se hace desde la
consola de Supabase. Nadie puede editarla ni borrarla — ni siquiera la
SUPER_ADMIN, que solo puede leerla. Se ve en **Portal → Equipo**.

### Lo interno y lo compartido

Cada actuación de un expediente nace **privada**. Aparece en el portal de la
clienta únicamente si alguien marcó a mano la casilla de compartir. Ese
recorte lo hace la política `case_events_select_own`, no el código de la
pantalla: aunque un error de programación mostrara la lista completa, la base
no habría enviado lo privado.

### El formulario público

Es lo único que escribe en la base sin sesión. La política que lo permite
está acotada al máximo: solo puede **insertar** en `leads`, solo con estado
`NUEVA`, y no puede leer nada — ni siquiera lo que acaba de escribir. Lleva
además un campo trampa invisible que descarta a los robots que rellenan todo
lo que encuentran.

### Cabeceras del navegador

Un navegador solo activa sus defensas si el servidor se las pide. Ahora se
piden (`next.config.mjs` y `proxy.ts`):

- **Content-Security-Policy.** Define de dónde puede cargarse cada cosa. En
  el portal y en la pantalla de acceso va en su forma fuerte: cada petición
  lleva un número de un solo uso (*nonce*) y el navegador ejecuta solo los
  scripts que lo llevan. Un script inyectado no lo tiene, así que no corre.
  En la web pública, que se pregenera y no toca datos de nadie, la política
  es igual de cerrada en todo lo demás pero sin nonce.
- **frame-ancestors / X-Frame-Options.** Nadie puede meter el portal en un
  iframe invisible para hacer que alguien pulse botones sin darse cuenta.
- **Strict-Transport-Security.** Obliga a HTTPS durante dos años.
- **Referrer-Policy.** La dirección completa —que lleva identificadores de
  casos y de clientas— no viaja a sitios ajenos.
- **Permissions-Policy.** Cámara, micrófono y ubicación quedan cerrados.
- **nosniff.** El navegador no "adivina" el tipo de un archivo servido.

### Las claves

- Solo se usa la clave **pública** de Supabase (`anon`). Por diseño viaja al
  navegador y no da acceso a nada por sí sola: todo pasa por RLS.
- **No hay ninguna clave de servicio (`service_role`) en este proyecto.** Esa
  clave se salta RLS por completo. Si algún día alguien la añade a una
  variable de entorno, todo lo dicho arriba deja de proteger ese código.
- `.gitignore` excluye los archivos `.env*` (menos el ejemplo), los volcados
  de base de datos y las carpetas de expedientes.

---

## 2. Lo que debe hacer usted

El código no puede hacer nada de esto.

### 🔴 Crítico: el resguardo de la información

Supabase en el plan gratuito **no guarda copias automáticas**. Si alguien
borra una tabla por error o la cuenta se pierde, no hay vuelta atrás: se
pierden todos los expedientes.

- Contrate el plan que incluye copias diarias, **o** exporte la base a mano
  con regularidad (Supabase → Database → Backups, o `pg_dump`).
- Guarde esa copia **fuera** de Supabase (un disco cifrado, otro servicio).
- Una copia que nunca se ha restaurado no es una copia. Pruebe a restaurarla
  al menos una vez.

### 🟠 Importante: cuentas y acceso

- **Active la verificación en dos pasos** en su cuenta de Supabase, en la de
  Vercel y en la de GitHub. Quien entre a cualquiera de las tres puede leer
  todos los expedientes; la contraseña sola no basta.
- **Una cuenta por persona.** Compartir un usuario deja la bitácora sin
  valor: no se sabe quién hizo qué.
- **Al salir alguien del despacho**, márquele la cuenta como inactiva desde
  Portal → Equipo el mismo día. Queda registrado y deja de entrar.
- **Revise los roles cada cierto tiempo.** Una cuenta de prueba con rol de
  abogada olvidada es una puerta abierta.
- Antes de vincular una cuenta de acceso con una clienta, **verifique el
  correo**. Esa vinculación es lo que le deja leer el expediente.

### 🟡 Recomendable

- Ponga un dominio propio con HTTPS (Vercel lo hace solo).
- No mande documentos sensibles por WhatsApp si puede evitarlo; use el
  correo del despacho o entrega en mano.
- Fije en Supabase → Auth una longitud mínima de contraseña razonable y
  active la protección contra contraseñas filtradas.

### 🔵 Lo legal, si esto crece

Con datos personales sensibles de terceros, la Ley 1581 de 2012 pide:

- Una **política de tratamiento de datos** publicada en el sitio.
- **Autorización expresa** de cada clienta (el formulario ya la menciona;
  para un uso serio conviene una casilla explícita y guardar la constancia).
- Registro de las bases de datos ante la **SIC** si el despacho supera los
  umbrales de la norma.
- Un procedimiento para atender peticiones de consulta, corrección y
  supresión.

Esto es una lista de comprobación, no asesoría jurídica — que en este
despacho saben mejor que nadie.

---

## 3. Lo que sigue pendiente en el código

Se sabe que falta. Ninguno bloquea el uso normal, pero conviene tenerlos a la
vista:

- **No hay gestión de documentos.** Los expedientes se guardan hoy fuera del
  sistema. Hacerlo bien exige Supabase Storage con políticas por caso, y es
  la siguiente fase natural.
- **No hay límite de envíos en el formulario público.** Un robot decidido
  puede llenar la tabla `leads` de basura. No expone nada (no puede leer),
  pero da trabajo de limpieza. La solución es un límite por IP en el borde.
- **No hay borrado de datos.** No se puede eliminar una clienta ni un caso
  desde la aplicación, solo marcarlos inactivos. Es deliberado —un borrado
  accidental de un expediente no tiene arreglo— pero significa que una
  petición de supresión de datos hay que atenderla a mano en Supabase.
- **No hay registro de accesos de lectura.** Se sabe quién cambió un rol,
  pero no quién abrió qué expediente. Para un despacho pequeño es
  proporcionado; si el equipo crece, deja de serlo.
- **La sesión no caduca por inactividad.** Dura lo que dure el token de
  Supabase. En un computador compartido, cerrar sesión al terminar es la
  única defensa.

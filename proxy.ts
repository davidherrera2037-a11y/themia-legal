import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Rutas privadas. Todo lo que empiece por aquí exige sesión.
 */
const PRIVADAS = ["/portal"];

/**
 * Rutas que reciben la política estricta con nonce.
 *
 * Un nonce es un número de un solo uso por petición: el servidor se lo pone
 * a sus propios scripts y el navegador ejecuta esos y ninguno más. Es la
 * defensa fuerte contra inyección de scripts, pero exige que la página se
 * renderice en cada petición — no se puede pregenerar, porque el número
 * cambia siempre.
 *
 * Por eso solo cubre el login y el portal (que ya se renderizan en cada
 * petición porque leen la sesión). La web pública se pregenera, no toca
 * datos de nadie y no tiene sesión que robar; recibe una política igual de
 * cerrada en todo lo demás, sin nonce.
 */
const CON_NONCE = ["/login", "/portal"];

function empiezaPor(ruta: string, prefijos: string[]) {
  return prefijos.some((p) => ruta === p || ruta.startsWith(`${p}/`));
}

/**
 * Construye la política de contenido.
 *
 * `nonce` viene solo en las rutas privadas. Cuando no hay, se permiten los
 * scripts en línea que Next escribe en las páginas pregeneradas — es la
 * única concesión, y se hace únicamente donde no hay sesión ni datos.
 *
 * Los estilos en línea se permiten siempre: Tailwind y React los escriben,
 * y un estilo inyectado es mucho menos peligroso que un script.
 */
function construirCSP(nonce: string | null, urlSupabase: string | undefined) {
  // Se acota al proyecto exacto en vez de abrir todo https:. Si la variable
  // no está, no se agrega nada.
  let origenSupabase = "";
  try {
    if (urlSupabase) origenSupabase = ` ${new URL(urlSupabase).origin}`;
  } catch {
    // Una URL mal escrita no debe tumbar cada petición del sitio.
  }

  const script = nonce
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    script,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${origenSupabase}`,
    "object-src 'none'",
    "base-uri 'self'",
    // El formulario público abre WhatsApp con window.open (una navegación,
    // no un envío), así que basta con permitir el propio sitio.
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Corre antes de que se renderice cualquier página: pone la política de
 * contenido, refresca la sesión de Supabase y bloquea el portal a quien no
 * ha entrado.
 *
 * El refresco tiene que pasar por aquí: un Server Component no puede
 * escribir cookies, así que sin esto la sesión se vencería y la persona
 * terminaría expulsada a mitad de trabajo.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const ruta = request.nextUrl.pathname;
  const esPrivada = empiezaPor(ruta, PRIVADAS);
  const nonce = empiezaPor(ruta, CON_NONCE)
    ? Buffer.from(crypto.randomUUID()).toString("base64")
    : null;
  const csp = construirCSP(nonce, url);

  // La cabecera va también en la petición, no solo en la respuesta: así es
  // como Next se entera del nonce y se lo pone a sus propios scripts.
  const cabecerasPeticion = new Headers(request.headers);
  cabecerasPeticion.set("Content-Security-Policy", csp);
  if (nonce) cabecerasPeticion.set("x-nonce", nonce);
  const conCabeceras = { request: { headers: cabecerasPeticion } };

  /** Toda respuesta que salga de aquí lleva la política, sin excepción. */
  const conCSP = <T extends NextResponse>(respuesta: T): T => {
    respuesta.headers.set("Content-Security-Policy", csp);
    return respuesta;
  };

  // Sin Supabase configurado la web pública sigue funcionando (no depende
  // de la base), pero el portal no puede existir.
  //
  // Aquí había un fallo de diseño: se mandaba /login a la portada. Para
  // quien intentaba entrar, el portal simplemente había dejado de existir
  // —un rebote sin explicación, imposible de distinguir de una avería—.
  // Ahora /login se sirve y es la propia pantalla la que dice qué falta;
  // el resto del portal se manda allí, que es donde está la explicación.
  //
  // La cabecera deja además el estado a la vista sin abrir el navegador:
  //   curl -I <url> | grep x-themia-auth
  if (!url || !clave) {
    if (esPrivada) {
      const destino = request.nextUrl.clone();
      destino.pathname = "/login";
      destino.search = "";
      return conCSP(NextResponse.redirect(destino));
    }
    const sinAuth = conCSP(NextResponse.next(conCabeceras));
    sinAuth.headers.set("x-themia-auth", "sin-configurar");
    return sinAuth;
  }

  let respuesta = NextResponse.next(conCabeceras);

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesNuevas) => {
        for (const { name, value } of cookiesNuevas) {
          request.cookies.set(name, value);
        }
        cabecerasPeticion.set("cookie", request.cookies.toString());
        respuesta = NextResponse.next({ request: { headers: cabecerasPeticion } });
        for (const { name, value, options } of cookiesNuevas) {
          respuesta.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && esPrivada) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    destino.search = "";
    // Para devolver a la persona a donde iba después de entrar.
    destino.searchParams.set("volver", ruta);
    return conCSP(NextResponse.redirect(destino));
  }

  // Quien ya tiene sesión no debería ver otra vez el formulario de entrada.
  if (user && ruta === "/login") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/portal";
    destino.search = "";
    return conCSP(NextResponse.redirect(destino));
  }

  return conCSP(respuesta);
}

export const config = {
  // Todas las rutas menos los archivos estáticos: la política de contenido
  // tiene que llegar también a la web pública, no solo al portal.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};

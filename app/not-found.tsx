import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-5xl text-gold">✦</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Esta página no existe
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Puede que el enlace esté mal escrito, o que el expediente al que
          apunta ya no esté disponible para tu cuenta.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}

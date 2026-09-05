"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Download, FileText, Loader2, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Vacio } from "@/components/ui/Card";
import { ErrorMsg, ExitoMsg, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import {
  FORMATOS_ADMITIDOS,
  TIPOS_DOCUMENTO_CASO,
  fechaCorta,
  opciones,
  pesoLegible,
  type TipoDocumentoCaso,
} from "@/lib/db/tipos";
import {
  cambiarVisibilidadDocumentoAction,
  enlaceDescargaAction,
  subirDocumentoAction,
} from "@/app/portal/equipo/casos/documentos-actions";

export type Documento = {
  id: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: string;
  description: string | null;
  visible_para_cliente: boolean;
  uploaded_by_name: string | null;
  created_at: string;
};

const ACEPTADOS = Object.keys(FORMATOS_ADMITIDOS).join(",");

/**
 * Botón de descarga.
 *
 * El enlace se pide en el momento y caduca en un minuto: el bucket es
 * privado, así que no existe una URL permanente que alguien pueda
 * reenviar y siga sirviendo mañana.
 */
function Descargar({ id, nombre }: { id: string; nombre: string }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pedir() {
    setCargando(true);
    setError(null);
    const r = await enlaceDescargaAction(id);
    setCargando(false);
    if (r.url) {
      // El enlace firmado lleva content-disposition, así que el navegador
      // lo descarga sin salir de la página.
      window.location.href = r.url;
    } else {
      setError(r.error ?? "No se pudo descargar.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={pedir}
        disabled={cargando}
        aria-label={`Descargar ${nombre}`}
        title={`Descargar ${nombre}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition-colors hover:bg-ink hover:text-cream disabled:opacity-50"
      >
        {cargando ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-800">
          {error}
        </span>
      )}
    </>
  );
}

function Visibilidad({ id, visible }: { id: string; visible: boolean }) {
  const [estado, accion] = useActionState(
    cambiarVisibilidadDocumentoAction,
    SIN_ESTADO,
  );
  return (
    <form action={accion}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="visible" value={visible ? "0" : "1"} />
      {estado.error && (
        <span className="sr-only" role="alert">
          {estado.error}
        </span>
      )}
      <button
        type="submit"
        className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-medium text-ink/60 transition-colors hover:border-ink/40 hover:text-ink"
        title={
          visible
            ? "Dejar de compartir con la clienta"
            : "Compartir con la clienta"
        }
      >
        {visible ? "Dejar de compartir" : "Compartir"}
      </button>
    </form>
  );
}

export function ListaDocumentos({
  documentos,
  gestionable = false,
}: {
  documentos: Documento[];
  /** Solo el equipo puede cambiar la visibilidad. */
  gestionable?: boolean;
}) {
  if (documentos.length === 0) {
    return (
      <Vacio>
        {gestionable
          ? "Sin documentos. Aquí van la demanda, los poderes, las pruebas y las providencias."
          : "Todavía no hay documentos compartidos contigo."}
      </Vacio>
    );
  }

  return (
    <ul className="divide-y divide-ink/10">
      {documentos.map((d) => (
        <li key={d.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5">
          <div className="flex min-w-0 flex-1 gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/8 text-ink/70">
              <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{d.file_name}</p>
              <p className="mt-0.5 text-xs text-ink/60">
                {TIPOS_DOCUMENTO_CASO[d.kind as TipoDocumentoCaso] ?? d.kind} ·{" "}
                {pesoLegible(d.size_bytes)} · {fechaCorta(d.created_at)}
                {gestionable && d.uploaded_by_name ? ` · ${d.uploaded_by_name}` : ""}
              </p>
              {d.description && (
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/65">
                  {d.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {gestionable && d.visible_para_cliente && (
              <Badge tono="exito">Visible</Badge>
            )}
            {gestionable && <Visibilidad id={d.id} visible={d.visible_para_cliente} />}
            <Descargar id={d.id} nombre={d.file_name} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SubirDocumento({ casoId }: { casoId: string }) {
  const [estado, accion] = useActionState(subirDocumentoAction, SIN_ESTADO);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} action={accion} className="mt-4 space-y-4">
      <input type="hidden" name="case_id" value={casoId} />
      <ErrorMsg>{estado.error}</ErrorMsg>
      <ExitoMsg>{estado.mensaje}</ExitoMsg>

      <Input
        name="archivo"
        label="Archivo"
        type="file"
        required
        accept={ACEPTADOS}
        hint="(PDF, imagen, Word, Excel o texto · máximo 20 MB)"
        className="file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-cream"
      />

      <Select
        name="kind"
        label="Qué es"
        defaultValue="OTRO"
        opciones={opciones(TIPOS_DOCUMENTO_CASO)}
      />

      <Textarea
        name="description"
        label="Descripción"
        hint="(opcional)"
        rows={2}
        maxLength={1000}
        placeholder="Ej: escaneo del poder firmado y autenticado"
      />

      <label className="flex items-start gap-2.5 text-sm text-ink/80">
        <input
          type="checkbox"
          name="visible_para_cliente"
          className="mt-0.5 h-4 w-4 rounded border-ink/30 accent-[var(--color-gold)]"
        />
        <span>
          Compartir con la clienta
          <span className="block text-xs text-ink/55">
            Podrá descargarlo desde su portal. Los borradores internos no se
            comparten.
          </span>
        </span>
      </label>

      <SubmitButton tamano="sm" pendiente="Subiendo...">
        <Paperclip className="h-4 w-4" aria-hidden="true" />
        Subir documento
      </SubmitButton>
    </form>
  );
}

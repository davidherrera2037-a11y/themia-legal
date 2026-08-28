"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "573133300599"; // 313 330 0599 con indicativo de Colombia

const AREAS = [
  "Derecho de familia",
  "Derecho civil",
  "Derecho laboral",
  "Derecho comercial y empresarial",
  "Derecho constitucional",
  "Derecho penal",
  "Servicios jurídicos",
  "Otro",
];

export function RequestForm() {
  const [name, setName] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const lines = [`Hola, soy ${name}.`, `Quiero una consulta sobre: ${area}.`];
    if (message.trim()) {
      lines.push(`Mi caso: ${message.trim()}`);
    }

    const text = encodeURIComponent(lines.join(" "));
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <section id="solicitud" className="reveal bg-cream px-6 py-4 sm:px-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-cream-soft p-8 sm:p-10">
        <h2 className="text-center font-display text-2xl font-semibold text-ink sm:text-3xl">
          Cuéntanos tu caso
        </h2>
        <p className="mt-2 text-center text-sm text-ink/70">
          Completa estos datos y te escribimos por WhatsApp para agendar tu
          consulta.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="req-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Nombre
            </label>
            <input
              id="req-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink placeholder:text-ink/40 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>

          <div>
            <label
              htmlFor="req-area"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Área de interés
            </label>
            <select
              id="req-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="req-message"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Cuéntanos brevemente tu caso{" "}
              <span className="text-ink/50">(opcional)</span>
            </label>
            <textarea
              id="req-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Un par de líneas nos ayudan a prepararnos antes de hablar contigo"
              className="w-full resize-none rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink placeholder:text-ink/40 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Enviar solicitud por WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}

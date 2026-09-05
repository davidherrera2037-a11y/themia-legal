type LogoProps = {
  className?: string;
  /**
   * Texto para lectores de pantalla. Sin él la marca se trata como
   * decorativa, que es lo correcto cuando al lado ya se lee "THEMIA
   * LEGAL": repetirlo obligaría a oír el nombre dos veces seguidas.
   */
  label?: string;
};

/**
 * El símbolo de la firma: la figura de la justicia sobre la T.
 *
 * Antes era un dibujo de relleno hecho a mano ("placeholder", lo decía el
 * propio archivo) que a tamaño grande parecía un monigote. Ahora es el
 * logotipo de verdad, extraído del lockup original.
 *
 * Va como máscara CSS y no como <img> por una razón: la página lo necesita
 * en oro sobre el papel, en crema sobre el fondo oscuro y casi
 * transparente como marca de agua. Con una máscara, el color lo pone
 * `currentColor` y basta una clase de texto para cambiarlo; con una imagen
 * harían falta tres archivos distintos.
 */
export function LogoMark({ className, label }: LogoProps) {
  const mascara = {
    WebkitMaskImage: "url('/images/logotipo.png')",
    maskImage: "url('/images/logotipo.png')",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    // Proporción del archivo: con la altura puesta por una clase, el ancho
    // sale solo y no hace falta declararlo en cada sitio.
    aspectRatio: "374 / 295",
    backgroundColor: "currentColor",
  } as const;

  return (
    <span
      className={`inline-block shrink-0 ${className ?? ""}`}
      style={mascara}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

/**
 * Conjunto de íconos lineales (24 x 24, trazo de 1.75 px) dibujados para el sistema.
 */
import type { SVGProps } from 'react';

const TRAZOS = {
  inicio: 'M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z',
  libro: 'M12 6.5C10.4 5 8 4.5 3.5 4.5v14c4.5 0 6.9.5 8.5 2 1.6-1.5 4-2 8.5-2v-14c-4.5 0-6.9.5-8.5 2zM12 6.5v14',
  formula: 'M17.5 4.5h-11l5.5 7.5-5.5 7.5h11',
  calculadora:
    'M6.5 2.5h11A1.5 1.5 0 0 1 19 4v16a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4a1.5 1.5 0 0 1 1.5-1.5zM8.5 6h7v3.5h-7zM8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17.5h.01M12 17.5h.01M15.5 17.5h.01',
  tabla: 'M3.5 4.5h17v15h-17zM3.5 9.5h17M3.5 14.5h17M9.5 4.5v15',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5 16 16',
  flechaDerecha: 'M5 12h14M13 6l6 6-6 6',
  flechaIzquierda: 'M19 12H5M11 6l-6 6 6 6',
  chevronDerecha: 'M9.5 6l6 6-6 6',
  reiniciar: 'M4 4.5v5h5M5.2 15a7.5 7.5 0 1 0 1.3-7.6L4 9.5',
  matraz: 'M9 3h6M10 3v6.5l-5.6 9.4a1.5 1.5 0 0 0 1.3 2.3h12.6a1.5 1.5 0 0 0 1.3-2.3L14 9.5V3M7.2 15.5h9.6',
  historial: 'M3.5 12a8.5 8.5 0 1 0 2.8-6.3L3.5 8.5M3.5 3.5v5h5M12 7.5V12l3 2',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 7.8h.01',
  alerta: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17.2h.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  curva: 'M2.5 18.5c3 0 4-3.2 5.4-7.2C9.3 7.2 10.3 4 12 4s2.7 3.2 4.1 7.3c1.4 4 2.4 7.2 5.4 7.2M2.5 21h19',
  baseDatos:
    'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  procesador: 'M7 7h10v10H7zM10 10h4v4h-4zM9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4',
  cerrar: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  bandera: 'M5 21V4M5 4.5h11.5l-2.5 4 2.5 4H5',
  capas: 'M12 3.5 3 8l9 4.5L21 8zM3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5',
  matriz: 'M7 4H4.5v16H7M17 4h2.5v16H17M8.5 8.5h.01M12 8.5h.01M15.5 8.5h.01M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01',
} as const;

export type NombreIcono = keyof typeof TRAZOS;

interface IconoProps extends SVGProps<SVGSVGElement> {
  nombre: NombreIcono;
}

export function Icono({ nombre, className = 'h-5 w-5', ...resto }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...resto}
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}

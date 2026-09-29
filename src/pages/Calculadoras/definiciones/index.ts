/**
 * Registro central de calculadoras. Para agregar una nueva técnica basta con
 * declarar su DefinicionCalculadora e incorporarla al arreglo de su unidad.
 */
import type { NumeroUnidad } from '../../../data/temario';
import type { DefinicionCalculadora } from './tipos';
import { CALCULADORAS_UNIDAD_1 } from './unidad1';
import { CALCULADORAS_UNIDAD_2 } from './unidad2';
import { CALCULADORAS_UNIDAD_3 } from './unidad3';
import { CALCULADORAS_UNIDAD_4 } from './unidad4';

export const CALCULADORAS: DefinicionCalculadora[] = [
  ...CALCULADORAS_UNIDAD_1,
  ...CALCULADORAS_UNIDAD_2,
  ...CALCULADORAS_UNIDAD_3,
  ...CALCULADORAS_UNIDAD_4,
];

export function obtenerCalculadora(id: string | undefined): DefinicionCalculadora | undefined {
  return CALCULADORAS.find((calculadora) => calculadora.id === id);
}

export function calculadorasDeUnidad(unidad: NumeroUnidad): DefinicionCalculadora[] {
  return CALCULADORAS.filter((calculadora) => calculadora.unidad === unidad);
}

export type { DefinicionCalculadora } from './tipos';

/**
 * Contrato declarativo de una calculadora: campos de captura, valores de ejemplo
 * y función de cálculo que traduce la salida del motor matemático a un ResultadoCalculadora.
 */
import type { ResultadoCalculadora } from '../../../components/MathResults/tipos';
import type { NumeroUnidad } from '../../../data/temario';

export type ValoresFormulario = Record<string, string>;

interface CampoBase {
  id: string;
  etiqueta: string;
  ayuda?: string;
  /** 'medio' permite colocar dos campos por fila en pantallas amplias. */
  ancho?: 'completo' | 'medio';
  visibleSi?: (valores: ValoresFormulario) => boolean;
}

export interface CampoNumero extends CampoBase {
  tipo: 'numero';
  simbolo?: string;
  sugerencias?: string[];
  sufijo?: string;
  placeholder?: string;
}

export interface CampoOpciones extends CampoBase {
  tipo: 'opciones';
  opciones: { valor: string; etiqueta: string; detalle?: string }[];
  destacado?: boolean;
}

export type FormatoDatos = 'vector' | 'matriz' | 'grupos' | 'factorial';

export interface CampoDatos extends CampoBase {
  tipo: 'datos';
  formato: FormatoDatos;
  filas?: number;
  placeholder?: string;
}

export interface CampoSeparador {
  tipo: 'separador';
  id: string;
  etiqueta: string;
  visibleSi?: (valores: ValoresFormulario) => boolean;
}

export type Campo = CampoNumero | CampoOpciones | CampoDatos | CampoSeparador;

export type Modalidad = 'Intervalo' | 'Prueba de hipótesis' | 'Modelo' | 'Análisis';

export interface DefinicionCalculadora {
  id: string;
  unidad: NumeroUnidad;
  seccion: string;
  titulo: string;
  resumen: string;
  modalidades: Modalidad[];
  campos: Campo[];
  valoresIniciales: ValoresFormulario;
  ejemplo: { descripcion: string; valores: ValoresFormulario };
  formulas: string[];
  calcular: (valores: ValoresFormulario) => ResultadoCalculadora;
}

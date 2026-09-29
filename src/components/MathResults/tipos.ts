/**
 * Modelo de presentación de resultados. Las calculadoras devuelven valores numéricos
 * sin formato; el panel los formatea con la precisión elegida por el usuario.
 */
import type { OrigenValor } from '../../utils/math/consultaTablas';
import type { Distribucion, TipoPrueba } from '../../utils/math/tipos';
import type { Formateador } from '../../utils/formato';

export type ValorPrincipal =
  | { tipo: 'intervalo'; inferior: number; superior: number }
  | { tipo: 'numero'; valor: number; simbolo?: string }
  | { tipo: 'ecuacion'; respuesta: string; terminos: { coeficiente: number; variable?: string }[] };

export interface MetricaResultado {
  etiqueta: string;
  valor: number | string;
  /** Notación con la sintaxis de Formula. */
  simbolo?: string;
  esValorP?: boolean;
  nota?: string;
}

export type CeldaTabla = number | string | null;

export interface TablaResultado {
  titulo: string;
  columnas: string[];
  filas: CeldaTabla[][];
  /** Índices de columnas que contienen valores p. */
  columnasValorP?: number[];
  /** Índices de filas a resaltar (por ejemplo, comparaciones significativas). */
  filasResaltadas?: number[];
  nota?: string;
}

export type GraficaResultado =
  | {
      tipo: 'intervalo';
      inferior: number;
      superior: number;
      estimador: number;
      parametro: string;
      referencia?: { valor: number; etiqueta: string };
    }
  | {
      tipo: 'distribucion';
      distribucion: Distribucion;
      estadistico: number;
      valoresCriticos: number[];
      tipoPrueba: TipoPrueba;
      simbolo: string;
      alfa: number;
    }
  | {
      tipo: 'dispersion';
      puntos: { x: number; y: number }[];
      recta?: { b0: number; b1: number };
      identidad?: boolean;
      etiquetaX: string;
      etiquetaY: string;
      titulo?: string;
    }
  | {
      tipo: 'barras';
      categorias: string[];
      series: { nombre: string; valores: number[] }[];
      etiquetaY: string;
    };

export interface ResultadoCalculadora {
  /** Rótulo del resultado principal, por ejemplo "Intervalo de confianza al 95%". */
  etiqueta: string;
  principal: ValorPrincipal;
  secundario?: { etiqueta: string; valor: number; esValorP?: boolean };
  hipotesis?: { nula: string; alternativa: string };
  decision?: { rechazarH0: boolean; texto: (f: Formateador) => string };
  metricas: MetricaResultado[];
  graficas?: GraficaResultado[];
  tablas?: TablaResultado[];
  interpretacion?: (f: Formateador) => string;
  avisos?: string[];
  /** Procedencia de los valores críticos consultados. */
  origenCriticos?: OrigenValor;
}

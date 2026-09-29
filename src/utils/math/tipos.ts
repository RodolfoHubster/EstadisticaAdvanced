/**
 * Tipos compartidos por el motor matemático.
 */
import type { Distribucion } from './distribuciones';

export type { Distribucion };

/** Dirección de la hipótesis alternativa. */
export type TipoPrueba = 'bilateral' | 'izquierda' | 'derecha';

/** Resultado de una estimación por intervalo. */
export interface IntervaloConfianza {
  /** Estimador puntual del parámetro. */
  estimador: number;
  limiteInferior: number;
  limiteSuperior: number;
  /** Nivel de confianza expresado como proporción (por ejemplo, 0.95). */
  nivelConfianza: number;
  /** Valores críticos empleados, en el orden en que aparecen en la fórmula. */
  valoresCriticos: number[];
  distribucion: Distribucion;
  errorEstandar?: number;
  margenError?: number;
}

/** Resultado de una prueba de hipótesis. */
export interface ResultadoPrueba {
  estadistico: number;
  valorP: number;
  /** Frontera(s) de la región de rechazo. */
  valoresCriticos: number[];
  rechazarH0: boolean;
  alfa: number;
  tipo: TipoPrueba;
  distribucion: Distribucion;
  errorEstandar?: number;
}

/** Error provocado por datos de entrada inválidos para un cálculo. */
export class ErrorCalculo extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorCalculo';
  }
}

/** Error que señala una técnica del temario cuya implementación está planificada. */
export class ErrorPendiente extends Error {
  constructor(tecnica: string) {
    super(`La técnica "${tecnica}" está planificada para una fase posterior del proyecto.`);
    this.name = 'ErrorPendiente';
  }
}

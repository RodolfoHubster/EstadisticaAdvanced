/**
 * Campos y constructores de resultados compartidos por las calculadoras.
 */
import { notacionPlana } from '../../../components/MathResults/textoResultado';
import type { MetricaResultado, ResultadoCalculadora } from '../../../components/MathResults/tipos';
import { formatearPorcentaje, formatearValorP, type Formateador } from '../../../utils/formato';
import type { IntervaloConfianza, ResultadoPrueba, TipoPrueba } from '../../../utils/math/tipos';
import type { CampoNumero, CampoOpciones, CampoSeparador, ValoresFormulario } from './tipos';

/* -------------------------------------------------------------------------- */
/* Campos                                                                      */
/* -------------------------------------------------------------------------- */

export const esModoPrueba = (valores: ValoresFormulario) => valores.modo === 'prueba';
export const esModoIntervalo = (valores: ValoresFormulario) => valores.modo !== 'prueba';

export function campoModo(): CampoOpciones {
  return {
    tipo: 'opciones',
    id: 'modo',
    etiqueta: 'Procedimiento',
    destacado: true,
    opciones: [
      { valor: 'intervalo', etiqueta: 'Intervalo de confianza' },
      { valor: 'prueba', etiqueta: 'Prueba de hipótesis' },
    ],
  };
}

export function separador(id: string, etiqueta: string, visibleSi?: (valores: ValoresFormulario) => boolean): CampoSeparador {
  return { tipo: 'separador', id, etiqueta, visibleSi };
}

export function campoConfianza(visibleSi: ((valores: ValoresFormulario) => boolean) | undefined = esModoIntervalo): CampoNumero {
  return {
    tipo: 'numero',
    id: 'confianza',
    etiqueta: 'Nivel de confianza',
    simbolo: '1 − α',
    sufijo: '%',
    sugerencias: ['90', '95', '99'],
    visibleSi,
  };
}

export function campoAlfa(visibleSi?: (valores: ValoresFormulario) => boolean): CampoNumero {
  return {
    tipo: 'numero',
    id: 'alfa',
    etiqueta: 'Nivel de significancia',
    simbolo: 'α',
    sugerencias: ['0.10', '0.05', '0.01'],
    visibleSi,
  };
}

export function campoTipoPrueba(parametro: string, valorNulo: string, siempreVisible = false): CampoOpciones {
  return {
    tipo: 'opciones',
    id: 'tipo',
    etiqueta: 'Hipótesis alternativa',
    visibleSi: siempreVisible ? undefined : esModoPrueba,
    opciones: [
      { valor: 'bilateral', etiqueta: 'Bilateral', detalle: `${parametro} ≠ ${valorNulo}` },
      { valor: 'izquierda', etiqueta: 'Izquierda', detalle: `${parametro} < ${valorNulo}` },
      { valor: 'derecha', etiqueta: 'Derecha', detalle: `${parametro} > ${valorNulo}` },
    ],
  };
}

export function leerTipoPrueba(valores: ValoresFormulario): TipoPrueba {
  return valores.tipo === 'izquierda' || valores.tipo === 'derecha' ? valores.tipo : 'bilateral';
}

/* -------------------------------------------------------------------------- */
/* Hipótesis y decisiones                                                      */
/* -------------------------------------------------------------------------- */

const RELACION: Record<TipoPrueba, string> = { bilateral: '≠', izquierda: '<', derecha: '>' };
const NOMBRE_PRUEBA: Record<TipoPrueba, string> = {
  bilateral: 'bilateral',
  izquierda: 'de cola izquierda',
  derecha: 'de cola derecha',
};

export function hipotesis(parametro: string, valorNulo: string, tipo: TipoPrueba) {
  return { nula: `${parametro} = ${valorNulo}`, alternativa: `${parametro} ${RELACION[tipo]} ${valorNulo}` };
}

/** Texto de la regla de decisión con base en el estadístico y el valor p. */
export function textoDecision(
  rechazarH0: boolean,
  simbolo: string,
  estadistico: number,
  valorP: number,
  alfa: number,
): (f: Formateador) => string {
  const nombre = notacionPlana(simbolo);
  return (f) =>
    rechazarH0
      ? `El estadístico ${nombre} = ${f(estadistico)} cae en la región de rechazo y el valor p (${formatearValorP(valorP)}) es menor que α = ${alfa}. Existe evidencia estadística suficiente para rechazar H₀.`
      : `El estadístico ${nombre} = ${f(estadistico)} no cae en la región de rechazo y el valor p (${formatearValorP(valorP)}) no es menor que α = ${alfa}. No existe evidencia suficiente para rechazar H₀.`;
}

/* -------------------------------------------------------------------------- */
/* Constructores de resultados                                                 */
/* -------------------------------------------------------------------------- */

function metricasCriticasIntervalo(ic: IntervaloConfianza): MetricaResultado[] {
  const [c1, c2] = ic.valoresCriticos;
  switch (ic.distribucion.tipo) {
    case 'normal':
      return [{ simbolo: 'z_{α/2}', etiqueta: 'Valor crítico', valor: c1 }];
    case 't':
      return [
        { simbolo: 't_{α/2}', etiqueta: 'Valor crítico', valor: c1 },
        { simbolo: 'ν', etiqueta: 'Grados de libertad', valor: ic.distribucion.gl },
      ];
    case 'chi2':
      return [
        { simbolo: 'χ^{2}_{α/2}', etiqueta: 'Crítico superior', valor: c1 },
        { simbolo: 'χ^{2}_{1−α/2}', etiqueta: 'Crítico inferior', valor: c2 },
        { simbolo: 'ν', etiqueta: 'Grados de libertad', valor: ic.distribucion.gl },
      ];
    case 'f':
      return [
        { simbolo: 'f_{α/2}(ν_{1}, ν_{2})', etiqueta: 'Crítico', valor: c1 },
        { simbolo: 'f_{α/2}(ν_{2}, ν_{1})', etiqueta: 'Crítico', valor: c2 },
        { simbolo: 'ν_{1}, ν_{2}', etiqueta: 'Grados de libertad', valor: `${ic.distribucion.gl1}, ${ic.distribucion.gl2}` },
      ];
  }
}

interface OpcionesIntervalo {
  ic: IntervaloConfianza;
  /** Parámetro estimado, por ejemplo "μ" o "μ_{1} − μ_{2}". */
  parametro: string;
  simboloEstimador: string;
  metricas?: MetricaResultado[];
  referencia?: { valor: number; etiqueta: string };
}

export function resultadoIntervalo({ ic, parametro, simboloEstimador, metricas = [], referencia }: OpcionesIntervalo): ResultadoCalculadora {
  const nivel = formatearPorcentaje(ic.nivelConfianza);
  const nombreParametro = notacionPlana(parametro);
  return {
    etiqueta: `Intervalo de confianza al ${nivel}`,
    principal: { tipo: 'intervalo', inferior: ic.limiteInferior, superior: ic.limiteSuperior },
    secundario: { etiqueta: `Estimador puntual ${notacionPlana(simboloEstimador)}`, valor: ic.estimador },
    metricas: [
      { simbolo: simboloEstimador, etiqueta: 'Estimador puntual', valor: ic.estimador },
      ...(ic.errorEstandar !== undefined ? [{ simbolo: 'EE', etiqueta: 'Error estándar', valor: ic.errorEstandar }] : []),
      ...(ic.margenError !== undefined ? [{ simbolo: 'E', etiqueta: 'Margen de error', valor: ic.margenError }] : []),
      ...metricasCriticasIntervalo(ic),
      ...metricas,
    ],
    graficas: [
      {
        tipo: 'intervalo',
        inferior: ic.limiteInferior,
        superior: ic.limiteSuperior,
        estimador: ic.estimador,
        parametro,
        referencia,
      },
    ],
    interpretacion: (f) =>
      `Con un nivel de confianza del ${nivel}, se estima que ${nombreParametro} se encuentra entre ${f(ic.limiteInferior)} y ${f(ic.limiteSuperior)}. Si el muestreo se repitiera muchas veces, aproximadamente el ${nivel} de los intervalos construidos con este procedimiento contendrían al valor verdadero del parámetro.`,
  };
}

function metricasCriticasPrueba(prueba: ResultadoPrueba, simbolo: string): MetricaResultado[] {
  const { valoresCriticos, tipo, distribucion } = prueba;
  const simetrica = distribucion.tipo === 'normal' || distribucion.tipo === 't';
  if (tipo === 'bilateral' && simetrica) {
    return [{ simbolo: `${simbolo}_{α/2}`, etiqueta: 'Valor crítico (±)', valor: Math.abs(valoresCriticos[1]) }];
  }
  if (tipo === 'bilateral') {
    return [
      { simbolo: `${simbolo}_{1−α/2}`, etiqueta: 'Crítico inferior', valor: valoresCriticos[0] },
      { simbolo: `${simbolo}_{α/2}`, etiqueta: 'Crítico superior', valor: valoresCriticos[1] },
    ];
  }
  return [
    {
      simbolo: tipo === 'derecha' ? `${simbolo}_{α}` : `${simbolo}_{1−α}`,
      etiqueta: 'Valor crítico',
      valor: valoresCriticos[0],
    },
  ];
}

function metricaGradosLibertad(prueba: ResultadoPrueba): MetricaResultado[] {
  const { distribucion } = prueba;
  if (distribucion.tipo === 't' || distribucion.tipo === 'chi2') {
    return [{ simbolo: 'ν', etiqueta: 'Grados de libertad', valor: distribucion.gl }];
  }
  if (distribucion.tipo === 'f') {
    return [{ simbolo: 'ν_{1}, ν_{2}', etiqueta: 'Grados de libertad', valor: `${distribucion.gl1}, ${distribucion.gl2}` }];
  }
  return [];
}

interface OpcionesPrueba {
  prueba: ResultadoPrueba;
  parametro: string;
  valorNulo: string;
  /** Símbolo del estadístico: "z", "t", "χ^{2}" o "F". */
  simbolo: string;
  metricas?: MetricaResultado[];
}

export function resultadoPrueba({ prueba, parametro, valorNulo, simbolo, metricas = [] }: OpcionesPrueba): ResultadoCalculadora {
  const tipo = prueba.tipo;
  return {
    etiqueta: `Prueba ${NOMBRE_PRUEBA[tipo]} · α = ${prueba.alfa}`,
    principal: { tipo: 'numero', valor: prueba.estadistico, simbolo },
    secundario: { etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
    hipotesis: hipotesis(parametro, valorNulo, tipo),
    decision: {
      rechazarH0: prueba.rechazarH0,
      texto: textoDecision(prueba.rechazarH0, simbolo, prueba.estadistico, prueba.valorP, prueba.alfa),
    },
    metricas: [
      { simbolo, etiqueta: 'Estadístico de prueba', valor: prueba.estadistico },
      { simbolo: 'p', etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
      ...metricasCriticasPrueba(prueba, simbolo),
      ...(prueba.errorEstandar !== undefined ? [{ simbolo: 'EE', etiqueta: 'Error estándar', valor: prueba.errorEstandar }] : []),
      ...metricaGradosLibertad(prueba),
      ...metricas,
    ],
    graficas: [
      {
        tipo: 'distribucion',
        distribucion: prueba.distribucion,
        estadistico: prueba.estadistico,
        valoresCriticos: prueba.valoresCriticos,
        tipoPrueba: tipo,
        simbolo,
        alfa: prueba.alfa,
      },
    ],
    interpretacion: () =>
      prueba.rechazarH0
        ? `Al nivel de significancia α = ${prueba.alfa}, los datos muestrales son incompatibles con H₀: ${notacionPlana(`${parametro} = ${valorNulo}`)}. La probabilidad de observar un resultado al menos tan extremo, si H₀ fuera cierta, es ${formatearValorP(prueba.valorP)}.`
        : `Al nivel de significancia α = ${prueba.alfa}, los datos muestrales son compatibles con H₀: ${notacionPlana(`${parametro} = ${valorNulo}`)}. No rechazar H₀ no demuestra que sea verdadera; indica que la evidencia no es suficiente para descartarla.`,
  };
}

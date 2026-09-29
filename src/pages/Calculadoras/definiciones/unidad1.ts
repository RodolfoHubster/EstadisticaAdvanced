/**
 * Calculadoras de la Unidad I: las nueve técnicas de inferencia del temario (1.3.1 a 1.9).
 */
import {
  intervaloCocienteVarianzas,
  intervaloDiferenciaMediasT,
  intervaloDiferenciaMediasZ,
  intervaloDiferenciaProporciones,
  intervaloMediaT,
  intervaloMediaZ,
  intervaloMuestrasPareadas,
  intervaloProporcion,
  intervaloVarianza,
  pruebaCocienteVarianzas,
  pruebaDiferenciaMediasT,
  pruebaDiferenciaMediasZ,
  pruebaDiferenciaProporciones,
  pruebaMediaT,
  pruebaMediaZ,
  pruebaMuestrasPareadas,
  pruebaProporcion,
  pruebaVarianza,
  type MuestraProporcion,
  type MuestraResumida,
  type MuestraVarianza,
} from '../../../utils/math/unidad1_inferencia';
import {
  campoAlfa,
  campoConfianza,
  campoModo,
  campoTipoPrueba,
  esModoPrueba,
  leerTipoPrueba,
  resultadoIntervalo,
  resultadoPrueba,
  separador,
} from './comunes';
import { leerAlfa, leerConfianza, leerNumero, leerVector } from './lectura';
import type { Campo, DefinicionCalculadora, ValoresFormulario } from './tipos';

/* -------------------------------------------------------------------------- */
/* Lectura de muestras                                                         */
/* -------------------------------------------------------------------------- */

function leerTamano(v: ValoresFormulario, id: string, minimo = 2): number {
  return leerNumero(v, id, { etiqueta: 'El tamaño de muestra', entero: true, minimo });
}

function leerMuestra(v: ValoresFormulario, sufijo = ''): MuestraResumida {
  return {
    n: leerTamano(v, `n${sufijo}`),
    media: leerNumero(v, `media${sufijo}`, { etiqueta: 'La media muestral' }),
    desviacion: leerNumero(v, `desviacion${sufijo}`, {
      etiqueta: 'La desviación estándar',
      minimo: 0,
      minimoExclusivo: true,
    }),
  };
}

function leerMuestraProporcion(v: ValoresFormulario, sufijo = ''): MuestraProporcion {
  const n = leerTamano(v, `n${sufijo}`, 1);
  const exitos = leerNumero(v, `exitos${sufijo}`, { etiqueta: 'El número de éxitos', entero: true, minimo: 0, maximo: n });
  return { n, exitos };
}

function leerMuestraVarianza(v: ValoresFormulario, sufijo = ''): MuestraVarianza {
  return {
    n: leerTamano(v, `n${sufijo}`),
    varianza: leerNumero(v, `varianza${sufijo}`, { etiqueta: 'La varianza muestral', minimo: 0, minimoExclusivo: true }),
  };
}

function parametrosPrueba(v: ValoresFormulario) {
  return { alfa: leerAlfa(v), tipo: leerTipoPrueba(v) };
}

/* -------------------------------------------------------------------------- */
/* Bloques de campos reutilizables                                             */
/* -------------------------------------------------------------------------- */

function camposMuestra(sufijo: string, etiquetaDesviacion: string, simboloDesviacion: string): Campo[] {
  const sub = sufijo ? `_{${sufijo}}` : '';
  const numero = sufijo ? ` ${sufijo}` : '';
  return [
    { tipo: 'numero', id: `n${sufijo}`, etiqueta: `Tamaño de muestra${numero}`, simbolo: `n${sub}`, ancho: 'medio' },
    { tipo: 'numero', id: `media${sufijo}`, etiqueta: `Media muestral${numero}`, simbolo: `x̄${sub}`, ancho: 'medio' },
    {
      tipo: 'numero',
      id: `desviacion${sufijo}`,
      etiqueta: `${etiquetaDesviacion}${numero}`,
      simbolo: `${simboloDesviacion}${sub}`,
      ancho: sufijo ? 'medio' : 'completo',
    },
  ];
}

function camposDosMuestras(etiquetaDesviacion: string, simboloDesviacion: string): Campo[] {
  const [n1, x1, s1] = camposMuestra('1', etiquetaDesviacion, simboloDesviacion);
  const [n2, x2, s2] = camposMuestra('2', etiquetaDesviacion, simboloDesviacion);
  return [
    separador('s-muestra-1', 'Muestra 1 y muestra 2'),
    n1,
    n2,
    x1,
    x2,
    s1,
    s2,
  ];
}

function camposParametros(parametro: string, valorNulo: string, campoNulo?: Campo): Campo[] {
  return [
    separador('s-parametros', 'Parámetros del procedimiento'),
    campoConfianza(),
    ...(campoNulo ? [campoNulo] : []),
    campoAlfa(esModoPrueba),
    campoTipoPrueba(parametro, valorNulo),
  ];
}

const BASE_PRUEBA = { modo: 'intervalo', confianza: '95', alfa: '0.05', tipo: 'bilateral' };

/* -------------------------------------------------------------------------- */
/* 1.3.1 Media, muestra grande                                                 */
/* -------------------------------------------------------------------------- */

const mediaMuestraGrande: DefinicionCalculadora = {
  id: 'media-muestra-grande',
  unidad: 1,
  seccion: '1.3.1',
  titulo: 'Media con muestra grande',
  resumen: 'Intervalo y prueba Z para la media poblacional μ con σ conocida o n ≥ 30.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    separador('s-muestra', 'Datos de la muestra'),
    ...camposMuestra('', 'Desviación estándar (σ, o s si n ≥ 30)', 'σ'),
    ...camposParametros('μ', 'μ_{0}', {
      tipo: 'numero',
      id: 'mu0',
      etiqueta: 'Media hipotética',
      simbolo: 'μ_{0}',
      visibleSi: esModoPrueba,
    }),
  ],
  valoresIniciales: { ...BASE_PRUEBA, n: '', media: '', desviacion: '', mu0: '' },
  ejemplo: {
    descripcion: 'Ejemplo del prototipo de diseño: n = 48, x̄ = 52.3 y s = 4.5; IC al 95%.',
    valores: { ...BASE_PRUEBA, n: '48', media: '52.3', desviacion: '4.5', mu0: '51' },
  },
  formulas: ['x̄ ± z_{α/2} · σ/√n', 'z = (x̄ − μ_{0}) / (σ/√n)'],
  calcular: (v) => {
    const muestra = leerMuestra(v);
    const avisos = muestra.n < 30 ? ['Con n < 30 y σ desconocida corresponde usar la distribución t (§1.3.2).'] : undefined;
    if (esModoPrueba(v)) {
      const mu0 = leerNumero(v, 'mu0', { etiqueta: 'La media hipotética' });
      const prueba = pruebaMediaZ(muestra, mu0, parametrosPrueba(v));
      return { ...resultadoPrueba({ prueba, parametro: 'μ', valorNulo: String(mu0), simbolo: 'z' }), avisos };
    }
    return { ...resultadoIntervalo({ ic: intervaloMediaZ(muestra, leerConfianza(v)), parametro: 'μ', simboloEstimador: 'x̄' }), avisos };
  },
};

/* -------------------------------------------------------------------------- */
/* 1.3.2 Media, muestra pequeña                                                */
/* -------------------------------------------------------------------------- */

const mediaMuestraPequena: DefinicionCalculadora = {
  id: 'media-muestra-pequena',
  unidad: 1,
  seccion: '1.3.2',
  titulo: 'Media con muestra pequeña',
  resumen: 'Intervalo y prueba t para μ con varianza desconocida y población aproximadamente normal.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    separador('s-muestra', 'Datos de la muestra'),
    ...camposMuestra('', 'Desviación estándar muestral', 's'),
    ...camposParametros('μ', 'μ_{0}', {
      tipo: 'numero',
      id: 'mu0',
      etiqueta: 'Media hipotética',
      simbolo: 'μ_{0}',
      visibleSi: esModoPrueba,
    }),
  ],
  valoresIniciales: { ...BASE_PRUEBA, n: '', media: '', desviacion: '', mu0: '' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 9: contenido de 7 contenedores, x̄ = 10.0 y s = 0.283.',
    valores: { ...BASE_PRUEBA, n: '7', media: '10', desviacion: '0.283', mu0: '10.3' },
  },
  formulas: ['x̄ ± t_{α/2, n−1} · s/√n', 't = (x̄ − μ_{0}) / (s/√n)'],
  calcular: (v) => {
    const muestra = leerMuestra(v);
    const avisos = muestra.n >= 30 ? ['Con n ≥ 30 la aproximación normal (§1.3.1) proporciona resultados prácticamente iguales.'] : undefined;
    if (esModoPrueba(v)) {
      const mu0 = leerNumero(v, 'mu0', { etiqueta: 'La media hipotética' });
      const prueba = pruebaMediaT(muestra, mu0, parametrosPrueba(v));
      return { ...resultadoPrueba({ prueba, parametro: 'μ', valorNulo: String(mu0), simbolo: 't' }), avisos };
    }
    return { ...resultadoIntervalo({ ic: intervaloMediaT(muestra, leerConfianza(v)), parametro: 'μ', simboloEstimador: 'x̄' }), avisos };
  },
};

/* -------------------------------------------------------------------------- */
/* 1.4 Proporción                                                              */
/* -------------------------------------------------------------------------- */

const proporcion: DefinicionCalculadora = {
  id: 'proporcion',
  unidad: 1,
  seccion: '1.4',
  titulo: 'Proporción poblacional',
  resumen: 'Intervalo y prueba Z para la proporción p con muestras grandes.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    separador('s-muestra', 'Datos de la muestra'),
    { tipo: 'numero', id: 'n', etiqueta: 'Tamaño de muestra', simbolo: 'n', ancho: 'medio' },
    { tipo: 'numero', id: 'exitos', etiqueta: 'Número de éxitos', simbolo: 'x', ancho: 'medio' },
    ...camposParametros('p', 'p_{0}', {
      tipo: 'numero',
      id: 'p0',
      etiqueta: 'Proporción hipotética',
      simbolo: 'p_{0}',
      visibleSi: esModoPrueba,
    }),
  ],
  valoresIniciales: { ...BASE_PRUEBA, n: '', exitos: '', p0: '' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 9: 340 de 500 hogares encuestados.',
    valores: { ...BASE_PRUEBA, n: '500', exitos: '340', p0: '0.7' },
  },
  formulas: ['p̂ ± z_{α/2} √(p̂q̂/n)', 'z = (p̂ − p_{0}) / √(p_{0}q_{0}/n)'],
  calcular: (v) => {
    const muestra = leerMuestraProporcion(v);
    const p = muestra.exitos / muestra.n;
    const avisos =
      muestra.n * p < 5 || muestra.n * (1 - p) < 5
        ? ['La aproximación normal requiere n·p̂ ≥ 5 y n·(1 − p̂) ≥ 5; el resultado puede ser impreciso.']
        : undefined;
    if (esModoPrueba(v)) {
      const p0 = leerNumero(v, 'p0', { etiqueta: 'La proporción hipotética', minimo: 0, minimoExclusivo: true, maximo: 1 });
      const prueba = pruebaProporcion(muestra, p0, parametrosPrueba(v));
      return {
        ...resultadoPrueba({
          prueba,
          parametro: 'p',
          valorNulo: String(p0),
          simbolo: 'z',
          metricas: [{ simbolo: 'p̂', etiqueta: 'Proporción muestral', valor: p }],
        }),
        avisos,
      };
    }
    return { ...resultadoIntervalo({ ic: intervaloProporcion(muestra, leerConfianza(v)), parametro: 'p', simboloEstimador: 'p̂' }), avisos };
  },
};

/* -------------------------------------------------------------------------- */
/* 1.5 Varianza                                                                */
/* -------------------------------------------------------------------------- */

const varianza: DefinicionCalculadora = {
  id: 'varianza',
  unidad: 1,
  seccion: '1.5',
  titulo: 'Varianza de una población normal',
  resumen: 'Intervalo y prueba ji-cuadrada para σ² (y σ) a partir de la varianza muestral.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    separador('s-muestra', 'Datos de la muestra'),
    { tipo: 'numero', id: 'n', etiqueta: 'Tamaño de muestra', simbolo: 'n', ancho: 'medio' },
    {
      tipo: 'numero',
      id: 'varianza',
      etiqueta: 'Varianza muestral',
      simbolo: 's^{2}',
      ancho: 'medio',
      ayuda: 'Si dispone de s, capture su cuadrado.',
    },
    ...camposParametros('σ^{2}', 'σ^{2}_{0}', {
      tipo: 'numero',
      id: 'varianza0',
      etiqueta: 'Varianza hipotética',
      simbolo: 'σ^{2}_{0}',
      visibleSi: esModoPrueba,
    }),
  ],
  valoresIniciales: { ...BASE_PRUEBA, n: '', varianza: '', varianza0: '' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 9: pesos de 10 paquetes con s² = 0.286.',
    valores: { ...BASE_PRUEBA, n: '10', varianza: '0.286', varianza0: '0.15' },
  },
  formulas: ['(n − 1)s^{2}/χ^{2}_{α/2} < σ^{2} < (n − 1)s^{2}/χ^{2}_{1−α/2}', 'χ^{2} = (n − 1)s^{2}/σ^{2}_{0}'],
  calcular: (v) => {
    const muestra = leerMuestraVarianza(v);
    if (esModoPrueba(v)) {
      const varianza0 = leerNumero(v, 'varianza0', { etiqueta: 'La varianza hipotética', minimo: 0, minimoExclusivo: true });
      const prueba = pruebaVarianza(muestra, varianza0, parametrosPrueba(v));
      return resultadoPrueba({ prueba, parametro: 'σ^{2}', valorNulo: String(varianza0), simbolo: 'χ^{2}' });
    }
    const ic = intervaloVarianza(muestra, leerConfianza(v));
    const resultado = resultadoIntervalo({
      ic,
      parametro: 'σ^{2}',
      simboloEstimador: 's^{2}',
      metricas: [
        { simbolo: 'σ', etiqueta: 'Límite inferior para σ', valor: ic.desviacionInferior },
        { simbolo: 'σ', etiqueta: 'Límite superior para σ', valor: ic.desviacionSuperior },
      ],
    });
    return { ...resultado, avisos: ['El procedimiento supone que la población muestreada es normal.'] };
  },
};

/* -------------------------------------------------------------------------- */
/* 1.6.1 Diferencia de medias, varianzas conocidas                             */
/* -------------------------------------------------------------------------- */

const campoD0: Campo = {
  tipo: 'numero',
  id: 'd0',
  etiqueta: 'Diferencia hipotética',
  simbolo: 'd_{0}',
  ayuda: 'Generalmente 0 (igualdad de medias).',
  visibleSi: esModoPrueba,
};

const diferenciaMediasConocida: DefinicionCalculadora = {
  id: 'diferencia-medias-conocida',
  unidad: 1,
  seccion: '1.6.1',
  titulo: 'Diferencia de medias, varianzas conocidas',
  resumen: 'Intervalo y prueba Z para μ₁ − μ₂ con σ₁ y σ₂ conocidas.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [campoModo(), ...camposDosMuestras('Desviación poblacional', 'σ'), ...camposParametros('μ_{1} − μ_{2}', 'd_{0}', campoD0)],
  valoresIniciales: { ...BASE_PRUEBA, n1: '', media1: '', desviacion1: '', n2: '', media2: '', desviacion2: '', d0: '0' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 9: rendimiento de dos tipos de motor; IC al 96%.',
    valores: {
      ...BASE_PRUEBA,
      confianza: '96',
      n1: '75',
      media1: '42',
      desviacion1: '8',
      n2: '50',
      media2: '36',
      desviacion2: '6',
      d0: '0',
    },
  },
  formulas: ['(x̄_{1} − x̄_{2}) ± z_{α/2} √(σ^{2}_{1}/n_{1} + σ^{2}_{2}/n_{2})'],
  calcular: (v) => {
    const m1 = leerMuestra(v, '1');
    const m2 = leerMuestra(v, '2');
    if (esModoPrueba(v)) {
      const d0 = leerNumero(v, 'd0', { etiqueta: 'La diferencia hipotética' });
      const prueba = pruebaDiferenciaMediasZ(m1, m2, d0, parametrosPrueba(v));
      return resultadoPrueba({ prueba, parametro: 'μ_{1} − μ_{2}', valorNulo: String(d0), simbolo: 'z' });
    }
    return resultadoIntervalo({
      ic: intervaloDiferenciaMediasZ(m1, m2, leerConfianza(v)),
      parametro: 'μ_{1} − μ_{2}',
      simboloEstimador: 'x̄_{1} − x̄_{2}',
      referencia: { valor: 0, etiqueta: '0' },
    });
  },
};

/* -------------------------------------------------------------------------- */
/* 1.6.2 Diferencia de medias, varianzas desconocidas                          */
/* -------------------------------------------------------------------------- */

const diferenciaMediasDesconocida: DefinicionCalculadora = {
  id: 'diferencia-medias-desconocida',
  unidad: 1,
  seccion: '1.6.2',
  titulo: 'Diferencia de medias, varianzas desconocidas',
  resumen: 'Intervalo y prueba t para μ₁ − μ₂ con varianza combinada o aproximación de Welch.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    ...camposDosMuestras('Desviación muestral', 's'),
    {
      tipo: 'opciones',
      id: 'supuesto',
      etiqueta: 'Supuesto sobre las varianzas',
      opciones: [
        { valor: 'iguales', etiqueta: 'Iguales', detalle: 'σ_{1} = σ_{2}' },
        { valor: 'distintas', etiqueta: 'Distintas (Welch)', detalle: 'σ_{1} ≠ σ_{2}' },
      ],
    },
    ...camposParametros('μ_{1} − μ_{2}', 'd_{0}', campoD0),
  ],
  valoresIniciales: {
    ...BASE_PRUEBA,
    supuesto: 'iguales',
    n1: '',
    media1: '',
    desviacion1: '',
    n2: '',
    media2: '',
    desviacion2: '',
    d0: '0',
  },
  ejemplo: {
    descripcion:
      'Walpole et al. (2012), cap. 9: calificaciones de dos grupos de un curso (instrucción convencional y material programado); IC al 90% con varianza combinada.',
    valores: {
      ...BASE_PRUEBA,
      confianza: '90',
      supuesto: 'iguales',
      n1: '12',
      media1: '85',
      desviacion1: '4',
      n2: '10',
      media2: '81',
      desviacion2: '5',
      d0: '0',
    },
  },
  formulas: [
    's^{2}_{p} = [(n_{1} − 1)s^{2}_{1} + (n_{2} − 1)s^{2}_{2}] / (n_{1} + n_{2} − 2)',
    '(x̄_{1} − x̄_{2}) ± t_{α/2} · s_{p}√(1/n_{1} + 1/n_{2})',
  ],
  calcular: (v) => {
    const m1 = leerMuestra(v, '1');
    const m2 = leerMuestra(v, '2');
    const iguales = v.supuesto !== 'distintas';
    const detalle = (d: { desviacionCombinada?: number; glExactos?: number }) =>
      iguales
        ? [{ simbolo: 's_{p}', etiqueta: 'Desviación combinada', valor: d.desviacionCombinada ?? Number.NaN }]
        : [{ simbolo: 'ν', etiqueta: 'Welch sin redondear', valor: d.glExactos ?? Number.NaN }];
    if (esModoPrueba(v)) {
      const d0 = leerNumero(v, 'd0', { etiqueta: 'La diferencia hipotética' });
      const prueba = pruebaDiferenciaMediasT(m1, m2, d0, parametrosPrueba(v), iguales);
      return resultadoPrueba({ prueba, parametro: 'μ_{1} − μ_{2}', valorNulo: String(d0), simbolo: 't', metricas: detalle(prueba) });
    }
    const ic = intervaloDiferenciaMediasT(m1, m2, leerConfianza(v), iguales);
    return resultadoIntervalo({
      ic,
      parametro: 'μ_{1} − μ_{2}',
      simboloEstimador: 'x̄_{1} − x̄_{2}',
      metricas: detalle(ic),
      referencia: { valor: 0, etiqueta: '0' },
    });
  },
};

/* -------------------------------------------------------------------------- */
/* 1.7 Diferencia de proporciones                                              */
/* -------------------------------------------------------------------------- */

const diferenciaProporciones: DefinicionCalculadora = {
  id: 'diferencia-proporciones',
  unidad: 1,
  seccion: '1.7',
  titulo: 'Diferencia de dos proporciones',
  resumen: 'Intervalo para p₁ − p₂ y prueba Z de igualdad con proporción combinada.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    separador('s-muestras', 'Muestra 1 y muestra 2'),
    { tipo: 'numero', id: 'n1', etiqueta: 'Tamaño de muestra 1', simbolo: 'n_{1}', ancho: 'medio' },
    { tipo: 'numero', id: 'n2', etiqueta: 'Tamaño de muestra 2', simbolo: 'n_{2}', ancho: 'medio' },
    { tipo: 'numero', id: 'exitos1', etiqueta: 'Éxitos en la muestra 1', simbolo: 'x_{1}', ancho: 'medio' },
    { tipo: 'numero', id: 'exitos2', etiqueta: 'Éxitos en la muestra 2', simbolo: 'x_{2}', ancho: 'medio' },
    ...camposParametros('p_{1} − p_{2}', '0'),
  ],
  valoresIniciales: { ...BASE_PRUEBA, n1: '', exitos1: '', n2: '', exitos2: '' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 9: proporción de piezas defectuosas antes y después de un cambio de proceso; IC al 90%.',
    valores: { ...BASE_PRUEBA, confianza: '90', n1: '1500', exitos1: '75', n2: '2000', exitos2: '80' },
  },
  formulas: ['(p̂_{1} − p̂_{2}) ± z_{α/2} √(p̂_{1}q̂_{1}/n_{1} + p̂_{2}q̂_{2}/n_{2})', 'z = (p̂_{1} − p̂_{2}) / √(p̂q̂(1/n_{1} + 1/n_{2}))'],
  calcular: (v) => {
    const m1 = leerMuestraProporcion(v, '1');
    const m2 = leerMuestraProporcion(v, '2');
    if (esModoPrueba(v)) {
      const prueba = pruebaDiferenciaProporciones(m1, m2, parametrosPrueba(v));
      return resultadoPrueba({
        prueba,
        parametro: 'p_{1} − p_{2}',
        valorNulo: '0',
        simbolo: 'z',
        metricas: [{ simbolo: 'p̂', etiqueta: 'Proporción combinada', valor: prueba.proporcionCombinada }],
      });
    }
    return resultadoIntervalo({
      ic: intervaloDiferenciaProporciones(m1, m2, leerConfianza(v)),
      parametro: 'p_{1} − p_{2}',
      simboloEstimador: 'p̂_{1} − p̂_{2}',
      referencia: { valor: 0, etiqueta: '0' },
    });
  },
};

/* -------------------------------------------------------------------------- */
/* 1.8 Cociente de varianzas                                                   */
/* -------------------------------------------------------------------------- */

const cocienteVarianzas: DefinicionCalculadora = {
  id: 'cociente-varianzas',
  unidad: 1,
  seccion: '1.8',
  titulo: 'Inferencia para dos varianzas',
  resumen: 'Intervalo para σ₁²/σ₂² y prueba F de igualdad de varianzas.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    separador('s-muestras', 'Muestra 1 y muestra 2'),
    { tipo: 'numero', id: 'n1', etiqueta: 'Tamaño de muestra 1', simbolo: 'n_{1}', ancho: 'medio' },
    { tipo: 'numero', id: 'n2', etiqueta: 'Tamaño de muestra 2', simbolo: 'n_{2}', ancho: 'medio' },
    { tipo: 'numero', id: 'varianza1', etiqueta: 'Varianza muestral 1', simbolo: 's^{2}_{1}', ancho: 'medio' },
    { tipo: 'numero', id: 'varianza2', etiqueta: 'Varianza muestral 2', simbolo: 's^{2}_{2}', ancho: 'medio' },
    ...camposParametros('σ^{2}_{1}/σ^{2}_{2}', '1'),
  ],
  valoresIniciales: { ...BASE_PRUEBA, n1: '', varianza1: '', n2: '', varianza2: '' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 9: s₁ = 3.07 (n₁ = 15) y s₂ = 0.80 (n₂ = 12); IC al 98%.',
    valores: { ...BASE_PRUEBA, confianza: '98', alfa: '0.02', n1: '15', varianza1: '9.4249', n2: '12', varianza2: '0.64' },
  },
  formulas: ['F = s^{2}_{1} / s^{2}_{2}', '(s^{2}_{1}/s^{2}_{2}) / f_{α/2}(ν_{1}, ν_{2}) < σ^{2}_{1}/σ^{2}_{2} < (s^{2}_{1}/s^{2}_{2}) · f_{α/2}(ν_{2}, ν_{1})'],
  calcular: (v) => {
    const m1 = leerMuestraVarianza(v, '1');
    const m2 = leerMuestraVarianza(v, '2');
    if (esModoPrueba(v)) {
      const prueba = pruebaCocienteVarianzas(m1, m2, parametrosPrueba(v));
      return resultadoPrueba({ prueba, parametro: 'σ^{2}_{1}/σ^{2}_{2}', valorNulo: '1', simbolo: 'F' });
    }
    return {
      ...resultadoIntervalo({
        ic: intervaloCocienteVarianzas(m1, m2, leerConfianza(v)),
        parametro: 'σ^{2}_{1}/σ^{2}_{2}',
        simboloEstimador: 's^{2}_{1}/s^{2}_{2}',
        referencia: { valor: 1, etiqueta: '1' },
      }),
      avisos: ['El procedimiento supone que ambas poblaciones son normales.'],
    };
  },
};

/* -------------------------------------------------------------------------- */
/* 1.9 Muestras pareadas                                                       */
/* -------------------------------------------------------------------------- */

const muestrasPareadas: DefinicionCalculadora = {
  id: 'muestras-pareadas',
  unidad: 1,
  seccion: '1.9',
  titulo: 'Diferencia de medias con muestras pareadas',
  resumen: 'Intervalo y prueba t sobre las diferencias dᵢ = x₁ᵢ − x₂ᵢ de observaciones relacionadas.',
  modalidades: ['Intervalo', 'Prueba de hipótesis'],
  campos: [
    campoModo(),
    separador('s-datos', 'Observaciones pareadas'),
    {
      tipo: 'datos',
      id: 'datos1',
      etiqueta: 'Muestra 1 (por ejemplo, antes)',
      formato: 'vector',
      filas: 3,
      placeholder: '142 138 150 145 …',
    },
    {
      tipo: 'datos',
      id: 'datos2',
      etiqueta: 'Muestra 2 (por ejemplo, después)',
      formato: 'vector',
      filas: 3,
      placeholder: '135 136 141 140 …',
      ayuda: 'Los valores se emparejan por posición.',
    },
    ...camposParametros('μ_{D}', 'd_{0}', campoD0),
  ],
  valoresIniciales: { ...BASE_PRUEBA, datos1: '', datos2: '', d0: '0' },
  ejemplo: {
    descripcion: 'Ejemplo ilustrativo: tiempo de respuesta (ms) de 10 servicios antes y después de una optimización.',
    valores: {
      ...BASE_PRUEBA,
      datos1: '142 138 150 145 160 155 148 152 139 147',
      datos2: '135 136 141 140 150 148 145 146 137 139',
      d0: '0',
    },
  },
  formulas: ['d̄ ± t_{α/2, n−1} · s_{d}/√n', 't = (d̄ − d_{0}) / (s_{d}/√n)'],
  calcular: (v) => {
    const x1 = leerVector(v, 'datos1', { etiqueta: 'Muestra 1', minimo: 2 });
    const x2 = leerVector(v, 'datos2', { etiqueta: 'Muestra 2', minimo: 2 });
    if (esModoPrueba(v)) {
      const d0 = leerNumero(v, 'd0', { etiqueta: 'La diferencia hipotética' });
      const prueba = pruebaMuestrasPareadas(x1, x2, d0, parametrosPrueba(v));
      return resultadoPrueba({
        prueba,
        parametro: 'μ_{D}',
        valorNulo: String(d0),
        simbolo: 't',
        metricas: [
          { simbolo: 'd̄', etiqueta: 'Media de las diferencias', valor: prueba.mediaDiferencias },
          { simbolo: 's_{d}', etiqueta: 'Desviación de las diferencias', valor: prueba.desviacionDiferencias },
        ],
      });
    }
    const ic = intervaloMuestrasPareadas(x1, x2, leerConfianza(v));
    return resultadoIntervalo({
      ic,
      parametro: 'μ_{D}',
      simboloEstimador: 'd̄',
      metricas: [
        { simbolo: 's_{d}', etiqueta: 'Desviación de las diferencias', valor: ic.desviacionDiferencias },
        { simbolo: 'n', etiqueta: 'Número de pares', valor: ic.n },
      ],
      referencia: { valor: 0, etiqueta: '0' },
    });
  },
};

export const CALCULADORAS_UNIDAD_1: DefinicionCalculadora[] = [
  mediaMuestraGrande,
  mediaMuestraPequena,
  proporcion,
  varianza,
  diferenciaMediasConocida,
  diferenciaMediasDesconocida,
  diferenciaProporciones,
  cocienteVarianzas,
  muestrasPareadas,
];

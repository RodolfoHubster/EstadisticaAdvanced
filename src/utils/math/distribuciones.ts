/**
 * Motor de distribuciones de probabilidad.
 *
 * Implementación nativa, sin dependencias externas, de las funciones de densidad,
 * distribución acumulada, función de supervivencia y cuantiles de las distribuciones
 * utilizadas en el curso: normal estándar, t de Student, ji-cuadrada, F de Fisher y
 * rango estudentizado (Tukey).
 *
 * Este módulo no importa ningún otro archivo para poder ejecutarse también desde
 * scripts de Node (generación de tablasCriticas.json).
 *
 * Referencias:
 * - Press, Teukolsky, Vetterling y Flannery (2007). Numerical Recipes, 3a ed., caps. 6.1-6.4.
 * - West, G. (2005). Better approximations to cumulative normal functions. Wilmott Magazine.
 * - Acklam, P. J. (2003). An algorithm for computing the inverse normal cumulative distribution function.
 * - Lund, R. E. y Lund, J. R. (1983). Probabilities and upper quantiles for the studentized range. JRSS C, 32(2).
 */

const EPSILON = 1e-15;
const MINIMO_FLOTANTE = 1e-300;
const MAX_ITERACIONES = 1000;
const RAIZ_DOS_PI = Math.sqrt(2 * Math.PI);

/** Distribución de referencia de un estadístico de prueba. */
export type Distribucion =
  | { tipo: 'normal' }
  | { tipo: 't'; gl: number }
  | { tipo: 'chi2'; gl: number }
  | { tipo: 'f'; gl1: number; gl2: number };

/* -------------------------------------------------------------------------- */
/* Funciones especiales                                                        */
/* -------------------------------------------------------------------------- */

const COEFICIENTES_LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
];

/** Logaritmo natural de la función gamma (aproximación de Lanczos, g = 7). */
export function lnGamma(z: number): number {
  if (z < 0.5) {
    // Fórmula de reflexión de Euler.
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - lnGamma(1 - z);
  }
  const x = z - 1;
  let suma = COEFICIENTES_LANCZOS[0];
  for (let i = 1; i < COEFICIENTES_LANCZOS.length; i++) {
    suma += COEFICIENTES_LANCZOS[i] / (x + i);
  }
  const t = x + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(suma);
}

/** Logaritmo natural de la función beta B(a, b). */
export function lnBeta(a: number, b: number): number {
  return lnGamma(a) + lnGamma(b) - lnGamma(a + b);
}

/** Serie para la función gamma incompleta regularizada inferior P(a, x). */
function gammaPSerie(a: number, x: number): number {
  let denominador = a;
  let termino = 1 / a;
  let suma = termino;
  for (let n = 0; n < MAX_ITERACIONES; n++) {
    denominador += 1;
    termino *= x / denominador;
    suma += termino;
    if (Math.abs(termino) < Math.abs(suma) * EPSILON) break;
  }
  return suma * Math.exp(-x + a * Math.log(x) - lnGamma(a));
}

/** Fracción continua (Lentz modificado) para la función gamma incompleta regularizada superior Q(a, x). */
function gammaQFraccion(a: number, x: number): number {
  let b = x + 1 - a;
  let c = 1 / MINIMO_FLOTANTE;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < MAX_ITERACIONES; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < MINIMO_FLOTANTE) d = MINIMO_FLOTANTE;
    c = b + an / c;
    if (Math.abs(c) < MINIMO_FLOTANTE) c = MINIMO_FLOTANTE;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}

/** Función gamma incompleta regularizada inferior P(a, x). */
export function gammaRegularizadaP(a: number, x: number): number {
  if (x <= 0) return 0;
  if (!Number.isFinite(x)) return 1;
  return x < a + 1 ? gammaPSerie(a, x) : 1 - gammaQFraccion(a, x);
}

/** Función gamma incompleta regularizada superior Q(a, x) = 1 - P(a, x). */
export function gammaRegularizadaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  if (!Number.isFinite(x)) return 0;
  return x < a + 1 ? 1 - gammaPSerie(a, x) : gammaQFraccion(a, x);
}

/** Fracción continua para la función beta incompleta (Numerical Recipes, betacf). */
function betaFraccion(a: number, b: number, x: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < MINIMO_FLOTANTE) d = MINIMO_FLOTANTE;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX_ITERACIONES; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < MINIMO_FLOTANTE) d = MINIMO_FLOTANTE;
    c = 1 + aa / c;
    if (Math.abs(c) < MINIMO_FLOTANTE) c = MINIMO_FLOTANTE;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < MINIMO_FLOTANTE) d = MINIMO_FLOTANTE;
    c = 1 + aa / c;
    if (Math.abs(c) < MINIMO_FLOTANTE) c = MINIMO_FLOTANTE;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return h;
}

/** Función beta incompleta regularizada I_x(a, b). */
export function betaIncompletaRegularizada(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const frente = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta(a, b));
  if (x < (a + 1) / (a + b + 2)) {
    return (frente * betaFraccion(a, b, x)) / a;
  }
  return 1 - (frente * betaFraccion(b, a, 1 - x)) / b;
}

/* -------------------------------------------------------------------------- */
/* Utilidades numéricas                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Invierte una función de distribución monótona creciente mediante bisección.
 * El intervalo [inferior, superior] se amplía automáticamente hacia la derecha
 * hasta contener al cuantil buscado.
 */
function invertirPorBiseccion(
  cdf: (x: number) => number,
  p: number,
  inferior: number,
  superior: number,
  toleranciaRelativa = 1e-13,
): number {
  let lo = inferior;
  let hi = superior;
  let ampliaciones = 0;
  while (cdf(hi) < p && ampliaciones < 1100) {
    lo = hi;
    hi = hi * 2 + 1;
    ampliaciones++;
  }
  for (let i = 0; i < 400; i++) {
    const medio = 0.5 * (lo + hi);
    if (cdf(medio) < p) lo = medio;
    else hi = medio;
    if (hi - lo <= toleranciaRelativa * Math.max(1, Math.abs(medio))) break;
  }
  return 0.5 * (lo + hi);
}

function validarProbabilidad(p: number): void {
  if (!(p > 0 && p < 1)) {
    throw new RangeError(`La probabilidad debe pertenecer al intervalo abierto (0, 1). Valor recibido: ${p}`);
  }
}

function validarGradosLibertad(gl: number, nombre = 'gl'): void {
  if (!(gl > 0) || !Number.isFinite(gl)) {
    throw new RangeError(`Los grados de libertad (${nombre}) deben ser positivos. Valor recibido: ${gl}`);
  }
}

/** Integración numérica por la regla de Simpson compuesta (n par). */
function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let suma = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    suma += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  }
  return (suma * h) / 3;
}

/* -------------------------------------------------------------------------- */
/* Distribución normal                                                         */
/* -------------------------------------------------------------------------- */

/** Función de densidad de la distribución normal. */
export function pdfNormal(x: number, media = 0, desviacion = 1): number {
  const z = (x - media) / desviacion;
  return Math.exp(-0.5 * z * z) / (desviacion * RAIZ_DOS_PI);
}

/**
 * Función de distribución acumulada normal estándar, algoritmo de Hart (1968)
 * en la forma de West (2005). Precisión de doble precisión en todo el dominio.
 */
function cdfNormalEstandar(x: number): number {
  const absoluto = Math.abs(x);
  let cola: number;
  if (absoluto > 37) {
    cola = 0;
  } else {
    const exponencial = Math.exp(-(absoluto * absoluto) / 2);
    if (absoluto < 7.07106781186547) {
      let b = 3.52624965998911e-2 * absoluto + 0.700383064443688;
      b = b * absoluto + 6.37396220353165;
      b = b * absoluto + 33.912866078383;
      b = b * absoluto + 112.079291497871;
      b = b * absoluto + 221.213596169931;
      b = b * absoluto + 220.206867912376;
      cola = exponencial * b;
      b = 8.83883476483184e-2 * absoluto + 1.75566716318264;
      b = b * absoluto + 16.064177579207;
      b = b * absoluto + 86.7807322029461;
      b = b * absoluto + 296.564248779674;
      b = b * absoluto + 637.333633378831;
      b = b * absoluto + 793.826512519948;
      b = b * absoluto + 440.413735824752;
      cola /= b;
    } else {
      let b = absoluto + 0.65;
      b = absoluto + 4 / b;
      b = absoluto + 3 / b;
      b = absoluto + 2 / b;
      b = absoluto + 1 / b;
      cola = exponencial / b / 2.506628274631;
    }
  }
  return x > 0 ? 1 - cola : cola;
}

/** Función de distribución acumulada normal: P(X <= x). */
export function cdfNormal(x: number, media = 0, desviacion = 1): number {
  return cdfNormalEstandar((x - media) / desviacion);
}

/** Función de supervivencia normal: P(X > x). */
export function sfNormal(x: number, media = 0, desviacion = 1): number {
  return cdfNormalEstandar(-(x - media) / desviacion);
}

const ACKLAM_A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
  -3.066479806614716e1, 2.506628277459239,
];
const ACKLAM_B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
  -1.328068155288572e1,
];
const ACKLAM_C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
  4.374664141464968, 2.938163982698783,
];
const ACKLAM_D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

/**
 * Cuantil de la distribución normal: valor x tal que P(X <= x) = p.
 * Aproximación racional de Acklam refinada con un paso del método de Halley.
 */
export function cuantilNormal(p: number, media = 0, desviacion = 1): number {
  validarProbabilidad(p);
  const pBajo = 0.02425;
  let x: number;
  if (p < pBajo) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((ACKLAM_C[0] * q + ACKLAM_C[1]) * q + ACKLAM_C[2]) * q + ACKLAM_C[3]) * q + ACKLAM_C[4]) * q + ACKLAM_C[5]) /
      ((((ACKLAM_D[0] * q + ACKLAM_D[1]) * q + ACKLAM_D[2]) * q + ACKLAM_D[3]) * q + 1);
  } else if (p <= 1 - pBajo) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((ACKLAM_A[0] * r + ACKLAM_A[1]) * r + ACKLAM_A[2]) * r + ACKLAM_A[3]) * r + ACKLAM_A[4]) * r + ACKLAM_A[5]) * q) /
      (((((ACKLAM_B[0] * r + ACKLAM_B[1]) * r + ACKLAM_B[2]) * r + ACKLAM_B[3]) * r + ACKLAM_B[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      -(((((ACKLAM_C[0] * q + ACKLAM_C[1]) * q + ACKLAM_C[2]) * q + ACKLAM_C[3]) * q + ACKLAM_C[4]) * q + ACKLAM_C[5]) /
      ((((ACKLAM_D[0] * q + ACKLAM_D[1]) * q + ACKLAM_D[2]) * q + ACKLAM_D[3]) * q + 1);
  }
  const error = cdfNormalEstandar(x) - p;
  const u = error * RAIZ_DOS_PI * Math.exp((x * x) / 2);
  x -= u / (1 + (x * u) / 2);
  return media + desviacion * x;
}

/* -------------------------------------------------------------------------- */
/* Distribución t de Student                                                   */
/* -------------------------------------------------------------------------- */

/** Función de densidad de la distribución t de Student con gl grados de libertad. */
export function pdfT(x: number, gl: number): number {
  validarGradosLibertad(gl);
  const lnDensidad =
    lnGamma((gl + 1) / 2) - lnGamma(gl / 2) - 0.5 * Math.log(gl * Math.PI) - ((gl + 1) / 2) * Math.log(1 + (x * x) / gl);
  return Math.exp(lnDensidad);
}

/** Función de distribución acumulada t de Student: P(T <= t). */
export function cdfT(t: number, gl: number): number {
  validarGradosLibertad(gl);
  if (t === Infinity) return 1;
  if (t === -Infinity) return 0;
  const colaDoble = betaIncompletaRegularizada(gl / (gl + t * t), gl / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * colaDoble : 0.5 * colaDoble;
}

/** Función de supervivencia t de Student: P(T > t). */
export function sfT(t: number, gl: number): number {
  return cdfT(-t, gl);
}

/** Cuantil de la distribución t de Student: valor t tal que P(T <= t) = p. */
export function cuantilT(p: number, gl: number): number {
  validarProbabilidad(p);
  validarGradosLibertad(gl);
  if (p === 0.5) return 0;
  if (p < 0.5) return -cuantilT(1 - p, gl);
  return invertirPorBiseccion((t) => cdfT(t, gl), p, 0, 2);
}

/* -------------------------------------------------------------------------- */
/* Distribución ji-cuadrada                                                    */
/* -------------------------------------------------------------------------- */

/** Función de densidad de la distribución ji-cuadrada. */
export function pdfChiCuadrada(x: number, gl: number): number {
  validarGradosLibertad(gl);
  if (x < 0) return 0;
  if (x === 0) {
    if (gl < 2) return Infinity;
    return gl === 2 ? 0.5 : 0;
  }
  const k = gl / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.LN2 - lnGamma(k));
}

/** Función de distribución acumulada ji-cuadrada: P(X <= x). */
export function cdfChiCuadrada(x: number, gl: number): number {
  validarGradosLibertad(gl);
  return gammaRegularizadaP(gl / 2, x / 2);
}

/** Función de supervivencia ji-cuadrada: P(X > x). */
export function sfChiCuadrada(x: number, gl: number): number {
  validarGradosLibertad(gl);
  return gammaRegularizadaQ(gl / 2, x / 2);
}

/** Cuantil de la distribución ji-cuadrada: valor x tal que P(X <= x) = p. */
export function cuantilChiCuadrada(p: number, gl: number): number {
  validarProbabilidad(p);
  validarGradosLibertad(gl);
  return invertirPorBiseccion((x) => cdfChiCuadrada(x, gl), p, 0, Math.max(1, gl));
}

/* -------------------------------------------------------------------------- */
/* Distribución F de Fisher                                                    */
/* -------------------------------------------------------------------------- */

/** Función de densidad de la distribución F con (gl1, gl2) grados de libertad. */
export function pdfF(x: number, gl1: number, gl2: number): number {
  validarGradosLibertad(gl1, 'gl1');
  validarGradosLibertad(gl2, 'gl2');
  if (x < 0) return 0;
  if (x === 0) {
    if (gl1 < 2) return Infinity;
    return gl1 === 2 ? 1 : 0;
  }
  const lnDensidad =
    0.5 * (gl1 * Math.log(gl1 * x) + gl2 * Math.log(gl2) - (gl1 + gl2) * Math.log(gl1 * x + gl2)) -
    Math.log(x) -
    lnBeta(gl1 / 2, gl2 / 2);
  return Math.exp(lnDensidad);
}

/** Función de distribución acumulada F: P(X <= x). */
export function cdfF(x: number, gl1: number, gl2: number): number {
  validarGradosLibertad(gl1, 'gl1');
  validarGradosLibertad(gl2, 'gl2');
  if (x <= 0) return 0;
  if (x === Infinity) return 1;
  return betaIncompletaRegularizada((gl1 * x) / (gl1 * x + gl2), gl1 / 2, gl2 / 2);
}

/** Función de supervivencia F: P(X > x). */
export function sfF(x: number, gl1: number, gl2: number): number {
  validarGradosLibertad(gl1, 'gl1');
  validarGradosLibertad(gl2, 'gl2');
  if (x <= 0) return 1;
  if (x === Infinity) return 0;
  return betaIncompletaRegularizada(gl2 / (gl2 + gl1 * x), gl2 / 2, gl1 / 2);
}

/** Cuantil de la distribución F: valor x tal que P(X <= x) = p. */
export function cuantilF(p: number, gl1: number, gl2: number): number {
  validarProbabilidad(p);
  return invertirPorBiseccion((x) => cdfF(x, gl1, gl2), p, 0, 2);
}

/* -------------------------------------------------------------------------- */
/* Distribución del rango estudentizado (Tukey)                                */
/* -------------------------------------------------------------------------- */

/**
 * Probabilidad de que el rango de k observaciones normales estándar independientes
 * sea menor que w:  P(R < w) = k * integral phi(z) [Phi(z) - Phi(z - w)]^(k-1) dz.
 */
function probabilidadRangoNormal(w: number, k: number): number {
  if (w <= 0) return 0;
  const integrando = (z: number) => {
    const diferencia = cdfNormalEstandar(z) - cdfNormalEstandar(z - w);
    return diferencia <= 0 ? 0 : pdfNormal(z) * Math.pow(diferencia, k - 1);
  };
  return Math.min(1, k * simpson(integrando, -8, 8, 240));
}

/**
 * Función de distribución acumulada del rango estudentizado Q con k medias
 * y gl grados de libertad del error: P(Q <= q).
 * Para gl = Infinity se reduce a la distribución del rango normal.
 */
export function cdfRangoEstudentizado(q: number, k: number, gl: number): number {
  if (!(k >= 2)) throw new RangeError('El rango estudentizado requiere k >= 2 tratamientos.');
  if (q <= 0) return 0;
  if (!Number.isFinite(gl)) return probabilidadRangoNormal(q, k);
  validarGradosLibertad(gl);
  // S = sqrt(chi2(gl) / gl), con densidad f(s) = 2 (gl/2)^(gl/2) / Gamma(gl/2) * s^(gl-1) * exp(-gl s^2 / 2).
  // Se integra en la variable u = ln(s) para resolver con precisión la región cercana a cero
  // cuando gl es pequeño: f(s) ds = f(e^u) e^u du.
  const lnConstante = Math.LN2 + (gl / 2) * Math.log(gl / 2) - lnGamma(gl / 2);
  const dispersion = 1 / Math.sqrt(2 * gl);
  const inferior = Math.max(1e-5, 1 - 9 * dispersion);
  const superior = 1 + 12 * dispersion + (gl < 5 ? 4 : 0);
  const integrando = (u: number) => {
    const s = Math.exp(u);
    return Math.exp(lnConstante + gl * u - (gl * s * s) / 2) * probabilidadRangoNormal(q * s, k);
  };
  const resultado = simpson(integrando, Math.log(inferior), Math.log(superior), 300);
  return Math.min(1, Math.max(0, resultado));
}

/** Cuantil del rango estudentizado: valor q tal que P(Q <= q) = p. */
export function cuantilRangoEstudentizado(p: number, k: number, gl: number): number {
  validarProbabilidad(p);
  let lo = 0;
  let hi = 8;
  while (cdfRangoEstudentizado(hi, k, gl) < p && hi < 1e4) {
    lo = hi;
    hi *= 2;
  }
  for (let i = 0; i < 60; i++) {
    const medio = 0.5 * (lo + hi);
    if (cdfRangoEstudentizado(medio, k, gl) < p) lo = medio;
    else hi = medio;
    if (hi - lo < 1e-7) break;
  }
  return 0.5 * (lo + hi);
}

/* -------------------------------------------------------------------------- */
/* Despacho genérico por distribución                                          */
/* -------------------------------------------------------------------------- */

/** Densidad de la distribución indicada evaluada en x. */
export function densidad(distribucion: Distribucion, x: number): number {
  switch (distribucion.tipo) {
    case 'normal':
      return pdfNormal(x);
    case 't':
      return pdfT(x, distribucion.gl);
    case 'chi2':
      return pdfChiCuadrada(x, distribucion.gl);
    case 'f':
      return pdfF(x, distribucion.gl1, distribucion.gl2);
  }
}

/** Distribución acumulada P(X <= x) de la distribución indicada. */
export function acumulada(distribucion: Distribucion, x: number): number {
  switch (distribucion.tipo) {
    case 'normal':
      return cdfNormal(x);
    case 't':
      return cdfT(x, distribucion.gl);
    case 'chi2':
      return cdfChiCuadrada(x, distribucion.gl);
    case 'f':
      return cdfF(x, distribucion.gl1, distribucion.gl2);
  }
}

/** Probabilidad de cola derecha P(X > x) de la distribución indicada. */
export function supervivencia(distribucion: Distribucion, x: number): number {
  switch (distribucion.tipo) {
    case 'normal':
      return sfNormal(x);
    case 't':
      return sfT(x, distribucion.gl);
    case 'chi2':
      return sfChiCuadrada(x, distribucion.gl);
    case 'f':
      return sfF(x, distribucion.gl1, distribucion.gl2);
  }
}

/** Cuantil de la distribución indicada: valor x tal que P(X <= x) = p. */
export function cuantil(distribucion: Distribucion, p: number): number {
  switch (distribucion.tipo) {
    case 'normal':
      return cuantilNormal(p);
    case 't':
      return cuantilT(p, distribucion.gl);
    case 'chi2':
      return cuantilChiCuadrada(p, distribucion.gl);
    case 'f':
      return cuantilF(p, distribucion.gl1, distribucion.gl2);
  }
}

/** Indica si la distribución es simétrica respecto al cero. */
export function esSimetrica(distribucion: Distribucion): boolean {
  return distribucion.tipo === 'normal' || distribucion.tipo === 't';
}

/**
 * Formulario de referencia por tema. Las expresiones usan la sintaxis del
 * componente Formula: subíndices con _{ } y superíndices con ^{ }.
 */
import type { NumeroUnidad } from './temario';

export interface Expresion {
  etiqueta?: string;
  expresion: string;
}

export interface EntradaFormulario {
  id: string;
  unidad: NumeroUnidad;
  seccion: string;
  titulo: string;
  expresiones: Expresion[];
  nota?: string;
  /** Identificador de la calculadora asociada, si existe. */
  calculadora?: string;
}

export const FORMULARIO: EntradaFormulario[] = [
  // Unidad I
  {
    id: 'media-grande',
    unidad: 1,
    seccion: '1.3.1',
    titulo: 'Media, muestra grande',
    expresiones: [
      { etiqueta: 'Intervalo', expresion: 'x̄ ± z_{α/2} · σ/√n' },
      { etiqueta: 'Estadístico', expresion: 'z = (x̄ − μ_{0}) / (σ/√n)' },
    ],
    nota: 'Si σ es desconocida y n ≥ 30, se sustituye por s.',
    calculadora: 'media-muestra-grande',
  },
  {
    id: 'media-pequena',
    unidad: 1,
    seccion: '1.3.2',
    titulo: 'Media, muestra pequeña',
    expresiones: [
      { etiqueta: 'Intervalo', expresion: 'x̄ ± t_{α/2, n−1} · s/√n' },
      { etiqueta: 'Estadístico', expresion: 't = (x̄ − μ_{0}) / (s/√n),   ν = n − 1' },
    ],
    nota: 'Supone una población aproximadamente normal.',
    calculadora: 'media-muestra-pequena',
  },
  {
    id: 'proporcion',
    unidad: 1,
    seccion: '1.4',
    titulo: 'Proporción, muestra grande',
    expresiones: [
      { etiqueta: 'Intervalo', expresion: 'p̂ ± z_{α/2} √(p̂q̂/n)' },
      { etiqueta: 'Estadístico', expresion: 'z = (p̂ − p_{0}) / √(p_{0}q_{0}/n)' },
    ],
    nota: 'Requiere n·p̂ ≥ 5 y n·q̂ ≥ 5, con q̂ = 1 − p̂.',
    calculadora: 'proporcion',
  },
  {
    id: 'varianza',
    unidad: 1,
    seccion: '1.5',
    titulo: 'Varianza de una población normal',
    expresiones: [
      { etiqueta: 'Intervalo', expresion: '(n − 1)s^{2}/χ^{2}_{α/2} < σ^{2} < (n − 1)s^{2}/χ^{2}_{1−α/2}' },
      { etiqueta: 'Estadístico', expresion: 'χ^{2} = (n − 1)s^{2}/σ^{2}_{0},   ν = n − 1' },
    ],
    calculadora: 'varianza',
  },
  {
    id: 'dos-medias-conocida',
    unidad: 1,
    seccion: '1.6.1',
    titulo: 'Diferencia de medias, varianzas conocidas',
    expresiones: [
      { etiqueta: 'Intervalo', expresion: '(x̄_{1} − x̄_{2}) ± z_{α/2} √(σ^{2}_{1}/n_{1} + σ^{2}_{2}/n_{2})' },
      { etiqueta: 'Estadístico', expresion: 'z = [(x̄_{1} − x̄_{2}) − d_{0}] / √(σ^{2}_{1}/n_{1} + σ^{2}_{2}/n_{2})' },
    ],
    calculadora: 'diferencia-medias-conocida',
  },
  {
    id: 'dos-medias-desconocida',
    unidad: 1,
    seccion: '1.6.2',
    titulo: 'Diferencia de medias, varianzas desconocidas',
    expresiones: [
      { etiqueta: 'Varianza combinada', expresion: 's^{2}_{p} = [(n_{1} − 1)s^{2}_{1} + (n_{2} − 1)s^{2}_{2}] / (n_{1} + n_{2} − 2)' },
      { etiqueta: 'Intervalo (σ₁ = σ₂)', expresion: '(x̄_{1} − x̄_{2}) ± t_{α/2, n₁+n₂−2} · s_{p}√(1/n_{1} + 1/n_{2})' },
      {
        etiqueta: 'Welch (σ₁ ≠ σ₂)',
        expresion: 'ν = (s^{2}_{1}/n_{1} + s^{2}_{2}/n_{2})^{2} / [(s^{2}_{1}/n_{1})^{2}/(n_{1} − 1) + (s^{2}_{2}/n_{2})^{2}/(n_{2} − 1)]',
      },
    ],
    nota: 'Con varianzas distintas, ν se redondea hacia abajo al entero más cercano.',
    calculadora: 'diferencia-medias-desconocida',
  },
  {
    id: 'dos-proporciones',
    unidad: 1,
    seccion: '1.7',
    titulo: 'Diferencia de dos proporciones',
    expresiones: [
      { etiqueta: 'Intervalo', expresion: '(p̂_{1} − p̂_{2}) ± z_{α/2} √(p̂_{1}q̂_{1}/n_{1} + p̂_{2}q̂_{2}/n_{2})' },
      { etiqueta: 'Estadístico', expresion: 'z = (p̂_{1} − p̂_{2}) / √(p̂q̂(1/n_{1} + 1/n_{2})),   p̂ = (x_{1} + x_{2})/(n_{1} + n_{2})' },
    ],
    calculadora: 'diferencia-proporciones',
  },
  {
    id: 'cociente-varianzas',
    unidad: 1,
    seccion: '1.8',
    titulo: 'Cociente de varianzas',
    expresiones: [
      { etiqueta: 'Estadístico', expresion: 'F = s^{2}_{1} / s^{2}_{2},   ν_{1} = n_{1} − 1,  ν_{2} = n_{2} − 1' },
      {
        etiqueta: 'Intervalo',
        expresion: '(s^{2}_{1}/s^{2}_{2}) · 1/f_{α/2}(ν_{1}, ν_{2}) < σ^{2}_{1}/σ^{2}_{2} < (s^{2}_{1}/s^{2}_{2}) · f_{α/2}(ν_{2}, ν_{1})',
      },
    ],
    calculadora: 'cociente-varianzas',
  },
  {
    id: 'pareadas',
    unidad: 1,
    seccion: '1.9',
    titulo: 'Muestras pareadas',
    expresiones: [
      { etiqueta: 'Diferencias', expresion: 'd_{i} = x_{1i} − x_{2i}' },
      { etiqueta: 'Intervalo', expresion: 'd̄ ± t_{α/2, n−1} · s_{d}/√n' },
      { etiqueta: 'Estadístico', expresion: 't = (d̄ − d_{0}) / (s_{d}/√n)' },
    ],
    calculadora: 'muestras-pareadas',
  },
  // Unidad II
  {
    id: 'recta-minimos-cuadrados',
    unidad: 2,
    seccion: '2.1',
    titulo: 'Recta de mínimos cuadrados',
    expresiones: [
      { etiqueta: 'Sumas', expresion: 'S_{xx} = Σ(x_{i} − x̄)^{2},   S_{xy} = Σ(x_{i} − x̄)(y_{i} − ȳ)' },
      { etiqueta: 'Coeficientes', expresion: 'b_{1} = S_{xy}/S_{xx},   b_{0} = ȳ − b_{1}x̄' },
      { etiqueta: 'Varianza del error', expresion: 's^{2} = SSE/(n − 2)' },
    ],
    calculadora: 'regresion-simple',
  },
  {
    id: 'correlacion-determinacion',
    unidad: 2,
    seccion: '2.2',
    titulo: 'Correlación y determinación',
    expresiones: [
      { etiqueta: 'Pearson', expresion: 'r = S_{xy} / √(S_{xx}S_{yy})' },
      { etiqueta: 'Determinación', expresion: 'R^{2} = SSR/SST = 1 − SSE/SST' },
      { etiqueta: 'Prueba ρ = 0', expresion: 't = r√(n − 2) / √(1 − r^{2})' },
    ],
    calculadora: 'correlacion',
  },
  {
    id: 'prediccion-simple',
    unidad: 2,
    seccion: '2.3',
    titulo: 'Predicción e inferencia sobre la pendiente',
    expresiones: [
      { etiqueta: 'Respuesta media', expresion: 'ŷ_{0} ± t_{α/2, n−2} · s√(1/n + (x_{0} − x̄)^{2}/S_{xx})' },
      { etiqueta: 'Nueva observación', expresion: 'ŷ_{0} ± t_{α/2, n−2} · s√(1 + 1/n + (x_{0} − x̄)^{2}/S_{xx})' },
      { etiqueta: 'Pendiente', expresion: 't = (b_{1} − β_{10}) / (s/√S_{xx})' },
    ],
    calculadora: 'regresion-simple',
  },
  // Unidad III
  {
    id: 'notacion-matricial',
    unidad: 3,
    seccion: '3.3',
    titulo: 'Notación matricial',
    expresiones: [
      { etiqueta: 'Modelo', expresion: 'y = Xβ + ε' },
      { etiqueta: 'Estimadores', expresion: 'β̂ = (X^{T}X)^{−1}X^{T}y' },
    ],
    calculadora: 'regresion-multiple',
  },
  {
    id: 'varianzas-covarianzas',
    unidad: 3,
    seccion: '3.4',
    titulo: 'Matriz de varianzas y covarianzas',
    expresiones: [
      { etiqueta: 'Matriz', expresion: 'Var(β̂) = σ^{2}(X^{T}X)^{−1} ≈ s^{2}(X^{T}X)^{−1}' },
      { etiqueta: 'Varianza del error', expresion: 's^{2} = SSE/(n − k − 1)' },
    ],
    calculadora: 'regresion-multiple',
  },
  {
    id: 'inferencias-multiple',
    unidad: 3,
    seccion: '3.5',
    titulo: 'Inferencias con el modelo múltiple',
    expresiones: [
      { etiqueta: 'Prueba global', expresion: 'F = (SSR/k) / (SSE/(n − k − 1))' },
      { etiqueta: 'Coeficiente individual', expresion: 't = β̂_{j} / √(s^{2}c_{jj})' },
      { etiqueta: 'R² ajustado', expresion: 'R^{2}_{aj} = 1 − (1 − R^{2})(n − 1)/(n − k − 1)' },
    ],
    calculadora: 'regresion-multiple',
  },
  // Unidad IV
  {
    id: 'independencia',
    unidad: 4,
    seccion: '4.2.2',
    titulo: 'Prueba de independencia',
    expresiones: [
      { etiqueta: 'Esperadas', expresion: 'e_{ij} = (total fila i)(total columna j)/n' },
      { etiqueta: 'Estadístico', expresion: 'χ^{2} = ΣΣ(o_{ij} − e_{ij})^{2}/e_{ij},   ν = (r − 1)(c − 1)' },
    ],
    calculadora: 'tabla-contingencia',
  },
  {
    id: 'bondad-ajuste',
    unidad: 4,
    seccion: '4.2.1',
    titulo: 'Bondad de ajuste de Pearson',
    expresiones: [{ etiqueta: 'Estadístico', expresion: 'χ^{2} = Σ(o_{i} − e_{i})^{2}/e_{i},   ν = k − 1 − m' }],
    nota: 'm es el número de parámetros estimados a partir de la muestra.',
    calculadora: 'bondad-ajuste',
  },
  {
    id: 'normalidad',
    unidad: 4,
    seccion: '4.2.3',
    titulo: 'Kolmogorov-Smirnov y Anderson-Darling',
    expresiones: [
      { etiqueta: 'K-S', expresion: 'D = máx |F_{n}(x) − F_{0}(x)|' },
      { etiqueta: 'A-D', expresion: 'A^{2} = −n − (1/n)Σ(2i − 1)[ln F(x_{(i)}) + ln(1 − F(x_{(n+1−i)}))]' },
      { etiqueta: 'Shapiro-Wilk', expresion: 'W = (Σa_{i}x_{(i)})^{2} / Σ(x_{i} − x̄)^{2}' },
    ],
    calculadora: 'normalidad',
  },
  {
    id: 'kruskal-wallis',
    unidad: 4,
    seccion: '4.2.6',
    titulo: 'Kruskal-Wallis',
    expresiones: [{ etiqueta: 'Estadístico', expresion: 'H = 12/(N(N + 1)) · ΣR^{2}_{i}/n_{i} − 3(N + 1)' }],
    calculadora: 'kruskal-wallis',
  },
  {
    id: 'anova-un-factor',
    unidad: 4,
    seccion: '4.3.2',
    titulo: 'ANOVA de un factor',
    expresiones: [
      { etiqueta: 'Descomposición', expresion: 'SST = SSTr + SSE' },
      { etiqueta: 'Estadístico', expresion: 'F = [SSTr/(k − 1)] / [SSE/(N − k)]' },
    ],
    calculadora: 'anova-un-factor',
  },
  {
    id: 'bloques',
    unidad: 4,
    seccion: '4.3.3',
    titulo: 'Bloques completos aleatorizados',
    expresiones: [
      { etiqueta: 'Descomposición', expresion: 'SST = SSTr + SSB + SSE' },
      { etiqueta: 'Grados de libertad', expresion: 'ν_{E} = (t − 1)(b − 1)' },
    ],
    calculadora: 'anova-bloques',
  },
  {
    id: 'factorial',
    unidad: 4,
    seccion: '4.3.4',
    titulo: 'Diseño factorial de dos factores',
    expresiones: [
      { etiqueta: 'Descomposición', expresion: 'SST = SSA + SSB + SSAB + SSE' },
      { etiqueta: 'Error', expresion: 'ν_{E} = ab(n − 1)' },
    ],
    calculadora: 'anova-factorial',
  },
  {
    id: 'comparaciones',
    unidad: 4,
    seccion: '4.3.5',
    titulo: 'Comparación de parejas de medias',
    expresiones: [
      { etiqueta: 'LSD de Fisher', expresion: 'LSD = t_{α/2, N−k} √(MSE(1/n_{i} + 1/n_{j}))' },
      { etiqueta: 'HSD de Tukey', expresion: 'HSD = q_{α}(k, N − k) √(MSE/n)' },
    ],
    calculadora: 'anova-un-factor',
  },
];

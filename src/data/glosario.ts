/**
 * Catálogo local del glosario. Se utiliza cuando Firestore no está configurado o
 * no responde, y sirve como semilla para poblar la colección `glosario`.
 */
import type { NumeroUnidad } from './temario';

export interface TerminoGlosario {
  id: string;
  termino: string;
  definicion: string;
  unidad: NumeroUnidad;
  seccion: string;
  /** Notación asociada, con la sintaxis de subíndices _{ } y superíndices ^{ }. */
  simbolo?: string;
}

export const GLOSARIO_LOCAL: TerminoGlosario[] = [
  // Unidad I
  {
    id: 'inferencia-estadistica',
    termino: 'Inferencia estadística',
    definicion:
      'Conjunto de métodos que permiten obtener conclusiones sobre una población a partir de la información de una muestra, cuantificando la incertidumbre asociada a dichas conclusiones.',
    unidad: 1,
    seccion: '1.1',
  },
  {
    id: 'parametro',
    termino: 'Parámetro',
    definicion:
      'Medida numérica que describe una característica de la población, como la media μ, la varianza σ² o la proporción p. En la práctica suele ser desconocido.',
    unidad: 1,
    seccion: '1.1',
  },
  {
    id: 'estadistico',
    termino: 'Estadístico',
    definicion:
      'Función de las observaciones de una muestra que no depende de parámetros desconocidos; por ejemplo, la media muestral x̄ o la varianza muestral s².',
    unidad: 1,
    seccion: '1.1',
  },
  {
    id: 'estimacion-puntual',
    termino: 'Estimación puntual',
    definicion: 'Valor único, calculado a partir de la muestra, que se emplea como aproximación de un parámetro poblacional.',
    unidad: 1,
    seccion: '1.1.1',
    simbolo: 'θ̂',
  },
  {
    id: 'estimacion-intervalo',
    termino: 'Estimación por intervalo',
    definicion:
      'Intervalo de valores construido a partir de la muestra que contiene al parámetro con un nivel de confianza especificado.',
    unidad: 1,
    seccion: '1.1.2',
  },
  {
    id: 'nivel-confianza',
    termino: 'Nivel de confianza',
    definicion:
      'Proporción 1 − α de los intervalos que, construidos con el mismo procedimiento en muestreos repetidos, contienen al valor verdadero del parámetro.',
    unidad: 1,
    seccion: '1.1.2',
    simbolo: '1 − α',
  },
  {
    id: 'margen-error',
    termino: 'Margen de error',
    definicion:
      'Semiamplitud de un intervalo de confianza simétrico: producto del valor crítico por el error estándar del estimador.',
    unidad: 1,
    seccion: '1.1.2',
    simbolo: 'E',
  },
  {
    id: 'prueba-hipotesis',
    termino: 'Prueba de hipótesis',
    definicion:
      'Procedimiento que, con base en la evidencia muestral, permite decidir si se rechaza una afirmación sobre un parámetro poblacional.',
    unidad: 1,
    seccion: '1.1.3',
  },
  {
    id: 'hipotesis-nula',
    termino: 'Hipótesis nula',
    definicion:
      'Afirmación sobre el parámetro que se supone verdadera mientras la evidencia muestral no indique lo contrario; generalmente expresa una igualdad.',
    unidad: 1,
    seccion: '1.1.3',
    simbolo: 'H_{0}',
  },
  {
    id: 'hipotesis-alternativa',
    termino: 'Hipótesis alternativa',
    definicion:
      'Afirmación que se acepta cuando se rechaza la hipótesis nula. Determina si la prueba es bilateral o de una cola.',
    unidad: 1,
    seccion: '1.1.3',
    simbolo: 'H_{1}',
  },
  {
    id: 'nivel-significancia',
    termino: 'Nivel de significancia',
    definicion:
      'Probabilidad máxima de cometer un error tipo I que el investigador está dispuesto a aceptar. Define el tamaño de la región de rechazo.',
    unidad: 1,
    seccion: '1.1.3',
    simbolo: 'α',
  },
  {
    id: 'error-tipo-i',
    termino: 'Error tipo I',
    definicion: 'Rechazar la hipótesis nula cuando es verdadera. Su probabilidad es α.',
    unidad: 1,
    seccion: '1.1.3',
  },
  {
    id: 'error-tipo-ii',
    termino: 'Error tipo II',
    definicion:
      'No rechazar la hipótesis nula cuando es falsa. Su probabilidad se denota β; la potencia de la prueba es 1 − β.',
    unidad: 1,
    seccion: '1.1.3',
    simbolo: 'β',
  },
  {
    id: 'valor-p',
    termino: 'Valor p',
    definicion:
      'Probabilidad, calculada bajo el supuesto de que H₀ es verdadera, de obtener un estadístico de prueba al menos tan extremo como el observado. Se rechaza H₀ cuando p < α.',
    unidad: 1,
    seccion: '1.1.3',
    simbolo: 'p',
  },
  {
    id: 'region-rechazo',
    termino: 'Región de rechazo',
    definicion:
      'Conjunto de valores del estadístico de prueba que conducen a rechazar H₀. Sus fronteras son los valores críticos.',
    unidad: 1,
    seccion: '1.1.3',
  },
  {
    id: 'error-estandar',
    termino: 'Error estándar',
    definicion:
      'Desviación estándar de la distribución muestral de un estimador; mide la variabilidad esperada del estimador entre muestras.',
    unidad: 1,
    seccion: '1.2',
    simbolo: 'σ_{x̄} = σ/√n',
  },
  {
    id: 'estimador-insesgado',
    termino: 'Estimador insesgado',
    definicion: 'Estimador cuyo valor esperado coincide con el parámetro que estima: E(θ̂) = θ.',
    unidad: 1,
    seccion: '1.2',
  },
  {
    id: 'eficiencia',
    termino: 'Eficiencia',
    definicion: 'Entre dos estimadores insesgados de un mismo parámetro, es más eficiente el que tiene menor varianza.',
    unidad: 1,
    seccion: '1.2',
  },
  {
    id: 'consistencia',
    termino: 'Consistencia',
    definicion:
      'Propiedad de un estimador cuya probabilidad de estar arbitrariamente cerca del parámetro tiende a uno conforme aumenta el tamaño de muestra.',
    unidad: 1,
    seccion: '1.2',
  },
  {
    id: 'teorema-limite-central',
    termino: 'Teorema del límite central',
    definicion:
      'Si n es suficientemente grande, la distribución de x̄ es aproximadamente normal con media μ y varianza σ²/n, sin importar la forma de la población. Como regla práctica se usa n ≥ 30.',
    unidad: 1,
    seccion: '1.3.1',
  },
  {
    id: 'distribucion-t',
    termino: 'Distribución t de Student',
    definicion:
      'Distribución del estadístico (x̄ − μ)/(s/√n) para muestras de una población normal con varianza desconocida. Depende de n − 1 grados de libertad.',
    unidad: 1,
    seccion: '1.3.2',
    simbolo: 't_{ν}',
  },
  {
    id: 'grados-libertad',
    termino: 'Grados de libertad',
    definicion:
      'Número de valores que pueden variar libremente al calcular un estadístico; determina la forma de las distribuciones t, ji-cuadrada y F.',
    unidad: 1,
    seccion: '1.3.2',
    simbolo: 'ν',
  },
  {
    id: 'distribucion-ji-cuadrada',
    termino: 'Distribución ji-cuadrada',
    definicion:
      'Distribución de (n − 1)s²/σ² cuando la muestra proviene de una población normal. Es asimétrica y toma solo valores positivos.',
    unidad: 1,
    seccion: '1.5',
    simbolo: 'χ^{2}_{ν}',
  },
  {
    id: 'varianza-combinada',
    termino: 'Varianza combinada',
    definicion:
      'Estimador ponderado de la varianza común de dos poblaciones que se suponen con varianzas iguales: s²ₚ = [(n₁ − 1)s₁² + (n₂ − 1)s₂²]/(n₁ + n₂ − 2).',
    unidad: 1,
    seccion: '1.6.2',
    simbolo: 's^{2}_{p}',
  },
  {
    id: 'aproximacion-welch',
    termino: 'Aproximación de Welch-Satterthwaite',
    definicion:
      'Cálculo aproximado de los grados de libertad de la prueba t para dos muestras cuando no se puede suponer igualdad de varianzas.',
    unidad: 1,
    seccion: '1.6.2',
  },
  {
    id: 'distribucion-f',
    termino: 'Distribución F',
    definicion:
      'Distribución del cociente de dos variables ji-cuadrada independientes divididas entre sus grados de libertad. Se usa para comparar varianzas y en el análisis de varianza.',
    unidad: 1,
    seccion: '1.8',
    simbolo: 'F_{ν₁, ν₂}',
  },
  {
    id: 'muestras-pareadas',
    termino: 'Muestras pareadas',
    definicion:
      'Pares de observaciones relacionadas, tomadas sobre la misma unidad experimental (por ejemplo, antes y después). El análisis se realiza sobre las diferencias dᵢ.',
    unidad: 1,
    seccion: '1.9',
    simbolo: 'd̄',
  },
  // Unidad II
  {
    id: 'regresion-lineal-simple',
    termino: 'Regresión lineal simple',
    definicion:
      'Modelo que describe la relación entre una variable de respuesta y una variable independiente mediante una recta: Y = β₀ + β₁x + ε.',
    unidad: 2,
    seccion: '2.1',
  },
  {
    id: 'minimos-cuadrados',
    termino: 'Método de mínimos cuadrados',
    definicion:
      'Criterio de estimación que elige los coeficientes que minimizan la suma de los cuadrados de los residuales, SSE = Σ(yᵢ − ŷᵢ)².',
    unidad: 2,
    seccion: '2.1',
  },
  {
    id: 'residual',
    termino: 'Residual',
    definicion: 'Diferencia entre el valor observado y el valor ajustado por el modelo: eᵢ = yᵢ − ŷᵢ.',
    unidad: 2,
    seccion: '2.1',
    simbolo: 'e_{i}',
  },
  {
    id: 'suma-cuadrados-error',
    termino: 'Suma de cuadrados del error',
    definicion:
      'Variabilidad de la respuesta no explicada por el modelo. Dividida entre sus grados de libertad estima la varianza del error σ².',
    unidad: 2,
    seccion: '2.1.1',
    simbolo: 'SSE',
  },
  {
    id: 'coeficiente-correlacion',
    termino: 'Coeficiente de correlación de Pearson',
    definicion:
      'Medida adimensional de la fuerza y dirección de la relación lineal entre dos variables; toma valores entre −1 y 1.',
    unidad: 2,
    seccion: '2.2',
    simbolo: 'r',
  },
  {
    id: 'coeficiente-determinacion',
    termino: 'Coeficiente de determinación',
    definicion:
      'Proporción de la variabilidad total de la respuesta explicada por el modelo de regresión: R² = SSR/SST = 1 − SSE/SST.',
    unidad: 2,
    seccion: '2.2',
    simbolo: 'R^{2}',
  },
  {
    id: 'intervalo-prediccion',
    termino: 'Intervalo de predicción',
    definicion:
      'Intervalo para una observación futura de la respuesta en un valor x₀. Es más amplio que el intervalo de confianza para la respuesta media porque incorpora la variabilidad del error.',
    unidad: 2,
    seccion: '2.3',
  },
  {
    id: 'inferencia-pendiente',
    termino: 'Inferencia sobre la pendiente',
    definicion:
      'Prueba de H₀: β₁ = 0 mediante t = b₁/(s/√Sₓₓ) con n − 2 grados de libertad. Rechazarla indica una relación lineal significativa.',
    unidad: 2,
    seccion: '2.3.1',
    simbolo: 'β_{1}',
  },
  {
    id: 'normalidad-error',
    termino: 'Normalidad del error',
    definicion:
      'Supuesto del modelo según el cual los errores siguen una distribución normal con media cero y varianza constante; se verifica sobre los residuales.',
    unidad: 2,
    seccion: '2.4',
  },
  // Unidad III
  {
    id: 'regresion-multiple',
    termino: 'Regresión lineal múltiple',
    definicion:
      'Modelo que relaciona una respuesta con k variables independientes: Y = β₀ + β₁x₁ + … + βₖxₖ + ε.',
    unidad: 3,
    seccion: '3.1',
  },
  {
    id: 'r2-ajustado',
    termino: 'Coeficiente de determinación ajustado',
    definicion:
      'Versión de R² que penaliza el número de variables del modelo; permite comparar modelos con distinta cantidad de predictores.',
    unidad: 3,
    seccion: '3.2',
    simbolo: 'R^{2}_{aj}',
  },
  {
    id: 'matriz-diseno',
    termino: 'Matriz de diseño',
    definicion:
      'Matriz X de orden n × (k + 1) cuya primera columna está formada por unos (intercepto) y las restantes por los valores de las variables independientes.',
    unidad: 3,
    seccion: '3.3',
    simbolo: 'X',
  },
  {
    id: 'ecuaciones-normales',
    termino: 'Ecuaciones normales',
    definicion:
      'Sistema (XᵀX)β = Xᵀy cuya solución, β̂ = (XᵀX)⁻¹Xᵀy, proporciona los estimadores de mínimos cuadrados.',
    unidad: 3,
    seccion: '3.3',
  },
  {
    id: 'matriz-varianzas-covarianzas',
    termino: 'Matriz de varianzas y covarianzas',
    definicion:
      'Matriz σ²(XᵀX)⁻¹ cuya diagonal contiene las varianzas de los coeficientes estimados y cuyos elementos fuera de la diagonal son sus covarianzas.',
    unidad: 3,
    seccion: '3.4',
    simbolo: 's^{2}(X^{T}X)^{−1}',
  },
  {
    id: 'multicolinealidad',
    termino: 'Multicolinealidad',
    definicion:
      'Dependencia lineal fuerte entre variables independientes. Vuelve inestable la inversión de XᵀX e infla los errores estándar de los coeficientes.',
    unidad: 3,
    seccion: '3.5',
  },
  {
    id: 'prueba-global-f',
    termino: 'Prueba global de significancia',
    definicion:
      'Prueba F de H₀: β₁ = β₂ = … = βₖ = 0. Su rechazo indica que al menos una variable independiente contribuye al modelo.',
    unidad: 3,
    seccion: '3.5',
  },
  // Unidad IV
  {
    id: 'tabla-contingencia',
    termino: 'Tabla de contingencia',
    definicion:
      'Arreglo de frecuencias observadas clasificadas según dos variables categóricas, con r filas y c columnas.',
    unidad: 4,
    seccion: '4.1',
  },
  {
    id: 'probabilidad-condicional',
    termino: 'Probabilidad condicional',
    definicion: 'Probabilidad de un evento dado que ocurrió otro: P(A | B) = P(A ∩ B)/P(B).',
    unidad: 4,
    seccion: '4.1.1',
  },
  {
    id: 'frecuencia-esperada',
    termino: 'Frecuencia esperada',
    definicion:
      'Número de observaciones que se esperaría en una categoría si la hipótesis nula fuera verdadera. Se recomienda que sea al menos 5 en cada celda.',
    unidad: 4,
    seccion: '4.2.1',
    simbolo: 'e_{i}',
  },
  {
    id: 'bondad-ajuste',
    termino: 'Prueba de bondad de ajuste',
    definicion:
      'Prueba que evalúa si las frecuencias observadas son compatibles con una distribución teórica especificada.',
    unidad: 4,
    seccion: '4.2.1',
  },
  {
    id: 'prueba-independencia',
    termino: 'Prueba de independencia',
    definicion:
      'Prueba ji-cuadrada que evalúa si dos variables categóricas de una tabla de contingencia son independientes; usa (r − 1)(c − 1) grados de libertad.',
    unidad: 4,
    seccion: '4.2.2',
  },
  {
    id: 'kolmogorov-smirnov',
    termino: 'Prueba de Kolmogorov-Smirnov',
    definicion:
      'Prueba de bondad de ajuste basada en la máxima distancia vertical D entre la función de distribución empírica y la teórica.',
    unidad: 4,
    seccion: '4.2.3',
    simbolo: 'D',
  },
  {
    id: 'anderson-darling',
    termino: 'Prueba de Anderson-Darling',
    definicion:
      'Prueba de bondad de ajuste que pondera con mayor peso las colas de la distribución; es especialmente sensible a desviaciones de la normalidad en los extremos.',
    unidad: 4,
    seccion: '4.2.4',
    simbolo: 'A^{2}',
  },
  {
    id: 'shapiro-wilk',
    termino: 'Prueba de Shapiro-Wilk',
    definicion:
      'Prueba de normalidad basada en la correlación entre los datos ordenados y los valores esperados de los estadísticos de orden normales; es de las más potentes para muestras pequeñas.',
    unidad: 4,
    seccion: '4.2.5',
    simbolo: 'W',
  },
  {
    id: 'prueba-no-parametrica',
    termino: 'Prueba no paramétrica',
    definicion:
      'Procedimiento que no supone una forma específica para la distribución de la población; suele trabajar con rangos. Ejemplo: la prueba de Kruskal-Wallis.',
    unidad: 4,
    seccion: '4.2.6',
  },
  {
    id: 'analisis-varianza',
    termino: 'Análisis de varianza',
    definicion:
      'Técnica que descompone la variabilidad total de una respuesta en componentes atribuibles a distintas fuentes para comparar simultáneamente varias medias.',
    unidad: 4,
    seccion: '4.3.1',
    simbolo: 'ANOVA',
  },
  {
    id: 'factor-tratamiento',
    termino: 'Factor y tratamiento',
    definicion:
      'Un factor es una variable controlada en un experimento; cada uno de sus niveles, o combinación de niveles, constituye un tratamiento.',
    unidad: 4,
    seccion: '4.3.1',
  },
  {
    id: 'cuadrado-medio',
    termino: 'Cuadrado medio',
    definicion:
      'Suma de cuadrados dividida entre sus grados de libertad. El cociente entre el cuadrado medio de tratamientos y el del error es el estadístico F.',
    unidad: 4,
    seccion: '4.3.2',
    simbolo: 'CM',
  },
  {
    id: 'diseno-bloques',
    termino: 'Diseño de bloques completos aleatorizados',
    definicion:
      'Diseño en el que las unidades experimentales se agrupan en bloques homogéneos y cada tratamiento se asigna una vez dentro de cada bloque, para aislar una fuente de variabilidad ajena.',
    unidad: 4,
    seccion: '4.3.3',
  },
  {
    id: 'interaccion',
    termino: 'Interacción',
    definicion:
      'Situación en un diseño factorial en la que el efecto de un factor depende del nivel del otro factor.',
    unidad: 4,
    seccion: '4.3.4',
    simbolo: 'AB',
  },
  {
    id: 'comparaciones-multiples',
    termino: 'Comparaciones múltiples',
    definicion:
      'Procedimientos posteriores al ANOVA (LSD de Fisher, HSD de Tukey, Dunnett) que identifican qué parejas de medias de tratamiento difieren significativamente.',
    unidad: 4,
    seccion: '4.3.5',
  },
];

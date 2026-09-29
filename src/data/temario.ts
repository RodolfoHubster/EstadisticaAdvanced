/**
 * Temario oficial del Programa de Unidad de Aprendizaje "Estadística Avanzada",
 * plan de estudios 2021-2, Ingeniería en Software y Tecnologías Emergentes (UABC).
 */

export type NumeroUnidad = 1 | 2 | 3 | 4;

export interface Tema {
  seccion: string;
  titulo: string;
  subtemas?: Tema[];
}

export interface Unidad {
  numero: NumeroUnidad;
  romano: 'I' | 'II' | 'III' | 'IV';
  titulo: string;
  tituloCorto: string;
  horas: number;
  competencia: string;
  temas: Tema[];
}

export const UNIDADES: Unidad[] = [
  {
    numero: 1,
    romano: 'I',
    titulo: 'Métodos de inferencia estadística',
    tituloCorto: 'Inferencia estadística',
    horas: 8,
    competencia:
      'Estimar parámetros estadísticos mediante la aplicación de intervalos de confianza y prueba de hipótesis, para coadyuvar en la toma de decisiones, con actitud crítica y analítica.',
    temas: [
      {
        seccion: '1.1',
        titulo: 'Inferencia estadística',
        subtemas: [
          { seccion: '1.1.1', titulo: 'Estimación puntual' },
          { seccion: '1.1.2', titulo: 'Estimación por intervalo' },
          { seccion: '1.1.3', titulo: 'Prueba de hipótesis' },
        ],
      },
      { seccion: '1.2', titulo: 'Propiedades de los estimadores' },
      {
        seccion: '1.3',
        titulo: 'Inferencia relacionada con la media',
        subtemas: [
          { seccion: '1.3.1', titulo: 'Muestras grandes' },
          { seccion: '1.3.2', titulo: 'Muestras pequeñas' },
        ],
      },
      { seccion: '1.4', titulo: 'Inferencia relacionada con la proporción (muestras grandes)' },
      { seccion: '1.5', titulo: 'Inferencias relacionadas con la varianza' },
      {
        seccion: '1.6',
        titulo: 'Inferencias relacionadas con la relación entre dos medias',
        subtemas: [
          { seccion: '1.6.1', titulo: 'Diferencia entre dos medias para varianza conocida' },
          { seccion: '1.6.2', titulo: 'Diferencia entre dos medias para varianza desconocida' },
        ],
      },
      { seccion: '1.7', titulo: 'Diferencia de dos proporciones' },
      { seccion: '1.8', titulo: 'Inferencia para dos varianzas' },
      { seccion: '1.9', titulo: 'Prueba para la diferencia de medias con muestras pareadas' },
    ],
  },
  {
    numero: 2,
    romano: 'II',
    titulo: 'Regresión lineal simple',
    tituloCorto: 'Regresión simple',
    horas: 6,
    competencia:
      'Analizar la relación entre dos variables asociadas a sistemas productivos, organizacionales y sociales, a través de modelos matemáticos que permitan predecir el comportamiento de las variables de interés.',
    temas: [
      {
        seccion: '2.1',
        titulo: 'Recta de mínimos cuadrados',
        subtemas: [{ seccion: '2.1.1', titulo: 'Estimación de los parámetros y significancia de los modelos de regresión' }],
      },
      { seccion: '2.2', titulo: 'Coeficiente de correlación y determinación' },
      {
        seccion: '2.3',
        titulo: 'Predicción de nuevas observaciones con el modelo de regresión lineal',
        subtemas: [{ seccion: '2.3.1', titulo: 'Inferencia acerca de la pendiente de la recta' }],
      },
      { seccion: '2.4', titulo: 'Prueba de la normalidad del error' },
    ],
  },
  {
    numero: 3,
    romano: 'III',
    titulo: 'Regresión lineal múltiple',
    tituloCorto: 'Regresión múltiple',
    horas: 8,
    competencia:
      'Analizar la relación entre múltiples variables asociadas a sistemas productivos, organizacionales y sociales, a través de modelos matemáticos que permitan predecir el comportamiento de las variables de interés.',
    temas: [
      {
        seccion: '3.1',
        titulo: 'Método de mínimos cuadrados',
        subtemas: [{ seccion: '3.1.1', titulo: 'Estimación de los parámetros y significancia de los modelos de regresión' }],
      },
      { seccion: '3.2', titulo: 'Coeficiente de correlación y determinación' },
      { seccion: '3.3', titulo: 'Regresión lineal múltiple en notación matricial' },
      { seccion: '3.4', titulo: 'Matriz de varianzas y covarianzas' },
      { seccion: '3.5', titulo: 'Inferencias con el modelo de regresión lineal' },
      { seccion: '3.6', titulo: 'Prueba de la normalidad del error' },
    ],
  },
  {
    numero: 4,
    romano: 'IV',
    titulo: 'Pruebas de bondad de ajuste y análisis de varianza',
    tituloCorto: 'Bondad de ajuste y ANOVA',
    horas: 10,
    competencia:
      'Identificar fuentes de variabilidad de diferentes sistemas, a través de la aplicación de metodologías de análisis de datos y análisis de varianza, para promover la mejora continua de procesos de una organización.',
    temas: [
      {
        seccion: '4.1',
        titulo: 'Tablas de contingencia',
        subtemas: [
          { seccion: '4.1.1', titulo: 'Análisis probabilístico o probabilidad condicional' },
          { seccion: '4.1.2', titulo: 'Análisis con estadística de contraste' },
        ],
      },
      {
        seccion: '4.2',
        titulo: 'Pruebas de bondad de ajuste',
        subtemas: [
          { seccion: '4.2.1', titulo: 'Prueba ji-cuadrado de Pearson' },
          { seccion: '4.2.2', titulo: 'Prueba de independencia' },
          { seccion: '4.2.3', titulo: 'Prueba de Kolmogorov-Smirnov' },
          { seccion: '4.2.4', titulo: 'Prueba de Anderson-Darling' },
          { seccion: '4.2.5', titulo: 'Test de Shapiro-Wilk' },
          { seccion: '4.2.6', titulo: 'Pruebas no paramétricas' },
        ],
      },
      {
        seccion: '4.3',
        titulo: 'Análisis de varianza',
        subtemas: [
          { seccion: '4.3.1', titulo: 'Conceptos básicos' },
          { seccion: '4.3.2', titulo: 'Análisis de varianza (ANOVA) de un solo factor' },
          { seccion: '4.3.3', titulo: 'Diseño de bloques completamente aleatorizados' },
          { seccion: '4.3.4', titulo: 'Análisis de varianza para un diseño factorial' },
          // El PUA numera este tema también como 4.3.4; se asigna 4.3.5 para que cada sección sea única.
          { seccion: '4.3.5', titulo: 'Comparación de parejas de medias de tratamiento' },
        ],
      },
    ],
  },
];

export const HORAS_TOTALES = UNIDADES.reduce((total, unidad) => total + unidad.horas, 0);

export function obtenerUnidad(numero: number): Unidad | undefined {
  return UNIDADES.find((unidad) => unidad.numero === numero);
}

/** Interpreta el parámetro de búsqueda ?unidad=N. */
export function leerUnidadDeParametro(valor: string | null): NumeroUnidad | null {
  const numero = Number(valor);
  return numero === 1 || numero === 2 || numero === 3 || numero === 4 ? numero : null;
}

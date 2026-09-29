/**
 * Genera src/utils/math/tablasCriticas.json a partir del motor de distribuciones.
 *
 * Uso: npm run tablas   (requiere Node.js 22.18 o superior, con eliminación de tipos nativa)
 *
 * Las tablas no se transcriben de un libro: se calculan con el mismo motor que usan
 * las calculadoras y se verifican contra los valores publicados en las pruebas
 * automatizadas (src/utils/math/__tests__).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  cdfNormal,
  cuantilChiCuadrada,
  cuantilF,
  cuantilNormal,
  cuantilRangoEstudentizado,
  cuantilT,
} from '../src/utils/math/distribuciones.ts';

type GradosLibertad = number | 'inf';

const redondear = (valor: number, decimales: number): number => Number(valor.toFixed(decimales));
const secuencia = (desde: number, hasta: number): number[] =>
  Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

/* Normal estándar ---------------------------------------------------------- */

const ALFAS_Z = [0.1, 0.05, 0.025, 0.01, 0.005, 0.001, 0.0005];

const filasNormalAcumulada: { z: string; valores: number[] }[] = [];
for (let decima = -34; decima <= 34; decima++) {
  const esNegativa = decima < 0;
  const etiqueta = (decima < 0 ? '-' : '') + (Math.abs(decima) / 10).toFixed(1);
  const base = Math.abs(decima) / 10;
  filasNormalAcumulada.push({
    z: etiqueta,
    valores: secuencia(0, 9).map((centesima) => {
      const z = esNegativa ? -(base + centesima / 100) : base + centesima / 100;
      return redondear(cdfNormal(z), 4);
    }),
  });
  if (decima === -1) {
    // Fila -0.0: valores de z en [-0.09, 0.00].
    filasNormalAcumulada.push({
      z: '-0.0',
      valores: secuencia(0, 9).map((centesima) => redondear(cdfNormal(-centesima / 100), 4)),
    });
  }
}

/* t de Student ------------------------------------------------------------- */

const ALFAS_T = [0.1, 0.05, 0.025, 0.01, 0.005, 0.001, 0.0005];
const GL_T: GradosLibertad[] = [...secuencia(1, 30), 40, 60, 120, 'inf'];

const tablaT = GL_T.map((gl) => ({
  gl,
  valores: ALFAS_T.map((alfa) => redondear(gl === 'inf' ? cuantilNormal(1 - alfa) : cuantilT(1 - alfa, gl), 4)),
}));

/* Ji-cuadrada -------------------------------------------------------------- */

const ALFAS_CHI = [0.995, 0.99, 0.975, 0.95, 0.9, 0.1, 0.05, 0.025, 0.01, 0.005];
const GL_CHI = [...secuencia(1, 30), 40, 50, 60, 70, 80, 90, 100];

const tablaChi = GL_CHI.map((gl) => ({
  gl,
  valores: ALFAS_CHI.map((alfa) => redondear(cuantilChiCuadrada(1 - alfa, gl), 4)),
}));

/* F de Fisher -------------------------------------------------------------- */

const GL1_F = [...secuencia(1, 10), 12, 15, 20, 24, 30, 40, 60, 120];
const GL2_F: GradosLibertad[] = [...secuencia(1, 30), 40, 60, 120, 'inf'];

const tablaF = (alfa: number) => ({
  alfa,
  descripcion: `Valores f_α(ν₁, ν₂) con área α = ${alfa} a la derecha. Columnas: ν₁ (numerador); filas: ν₂ (denominador).`,
  gl1: GL1_F,
  filas: GL2_F.map((gl2) => ({
    gl2,
    valores: GL1_F.map((gl1) =>
      redondear(gl2 === 'inf' ? cuantilChiCuadrada(1 - alfa, gl1) / gl1 : cuantilF(1 - alfa, gl1, gl2), 4),
    ),
  })),
});

/* Rango estudentizado ------------------------------------------------------ */

const K_TUKEY = secuencia(2, 10);
const GL_TUKEY: GradosLibertad[] = [...secuencia(1, 20), 24, 30, 40, 60, 120, 'inf'];

const tablaTukey = (alfa: number) => ({
  alfa,
  descripcion: `Valores q_α(k, ν) del rango estudentizado con α = ${alfa}. Columnas: k (número de medias); filas: ν (grados de libertad del error).`,
  k: K_TUKEY,
  filas: GL_TUKEY.map((gl) => {
    process.stdout.write(`  Tukey alfa=${alfa} gl=${gl}\n`);
    return {
      gl,
      valores: K_TUKEY.map((k) => redondear(cuantilRangoEstudentizado(1 - alfa, k, gl === 'inf' ? Infinity : gl), 3)),
    };
  }),
});

/* Ensamble ------------------------------------------------------------------ */

console.log('Generando tablas críticas...');

const tablas = {
  metadatos: {
    titulo: 'Tablas de valores críticos - Estadística Avanzada (UABC)',
    version: '1.0.0',
    generado: new Date().toISOString().slice(0, 10),
    convencion:
      'Salvo la tabla de la normal acumulada, cada valor crítico deja un área α a su derecha, como en Walpole et al. (2012), apéndice A.',
    generadoPor: 'scripts/generarTablasCriticas.ts a partir de src/utils/math/distribuciones.ts',
    referencias: [
      'Walpole, R. E., Myers, R. H., Myers, S. L. y Ye, K. E. (2012). Probabilidad y Estadística para Ingeniería y Ciencias. Pearson.',
      'Montgomery, D. C. (2017). Design and Analysis of Experiments (9th ed.). Wiley.',
    ],
  },
  normal: {
    criticos: {
      descripcion: 'Valores z_α con área α a la derecha de la normal estándar.',
      alfas: ALFAS_Z,
      valores: ALFAS_Z.map((alfa) => redondear(cuantilNormal(1 - alfa), 4)),
    },
    acumulada: {
      descripcion: 'Áreas bajo la curva normal estándar: P(Z <= z). Fila: entero y décima de z; columna: centésima.',
      columnas: secuencia(0, 9).map((c) => c / 100),
      filas: filasNormalAcumulada,
    },
  },
  tStudent: {
    descripcion: 'Valores t_α(ν) con área α a la derecha. Filas: grados de libertad ν.',
    alfas: ALFAS_T,
    filas: tablaT,
  },
  chiCuadrada: {
    descripcion: 'Valores χ²_α(ν) con área α a la derecha. Filas: grados de libertad ν.',
    alfas: ALFAS_CHI,
    filas: tablaChi,
  },
  fisher: [tablaF(0.05), tablaF(0.01)],
  rangoEstudentizado: [tablaTukey(0.05), tablaTukey(0.01)],
};

const destino = fileURLToPath(new URL('../src/utils/math/tablasCriticas.json', import.meta.url));
writeFileSync(destino, `${JSON.stringify(tablas, null, 2)}\n`, 'utf8');
console.log(`Tablas escritas en ${destino}`);

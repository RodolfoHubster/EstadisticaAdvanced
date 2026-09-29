import { describe, expect, it } from 'vitest';
import { cuantilNormal } from '../distribuciones';
import { ErrorPendiente } from '../tipos';
import {
  analizarTablaContingencia,
  anovaBloques,
  anovaFactorial,
  anovaUnFactor,
  comparacionesLSD,
  comparacionesTukey,
  pruebaAndersonDarling,
  pruebaBondadAjuste,
  pruebaIndependencia,
  pruebaKolmogorovSmirnov,
  pruebaKruskalWallis,
  pruebaShapiroWilk,
} from '../unidad4_anova';

describe('4.1 Tablas de contingencia', () => {
  const tabla = [
    [10, 20],
    [30, 40],
  ];

  it('calcula probabilidades marginales y condicionales', () => {
    const analisis = analizarTablaContingencia(tabla);
    expect(analisis.total).toBe(100);
    expect(analisis.marginalFila).toEqual([0.3, 0.7]);
    expect(analisis.condicionalDadaFila[0][1]).toBeCloseTo(2 / 3, 10);
  });

  it('prueba de independencia: chi2 = 0.7937 con 1 grado de libertad', () => {
    const prueba = pruebaIndependencia(tabla, 0.05);
    expect(prueba.esperadas).toEqual([
      [12, 18],
      [28, 42],
    ]);
    expect(prueba.estadistico).toBeCloseTo(0.79365, 5);
    expect(prueba.gl).toBe(1);
    expect(prueba.valorCritico).toBeCloseTo(3.8415, 4);
    expect(prueba.origenCritico).toBe('tabla');
    expect(prueba.rechazarH0).toBe(false);
  });
});

describe('4.2 Pruebas de bondad de ajuste', () => {
  it('Walpole: 120 lanzamientos de un dado, chi2 = 1.7', () => {
    const prueba = pruebaBondadAjuste([20, 22, 17, 18, 19, 24], {}, 0.05);
    expect(prueba.estadistico).toBeCloseTo(1.7, 10);
    expect(prueba.gl).toBe(5);
    expect(prueba.rechazarH0).toBe(false);
  });

  it('datos normales ideales no rechazan normalidad (Anderson-Darling y K-S)', () => {
    const n = 25;
    const datos = Array.from({ length: n }, (_, i) => 50 + 10 * cuantilNormal((i + 0.5) / n));
    const ad = pruebaAndersonDarling(datos, 0.05);
    expect(ad.valorP).toBeGreaterThan(0.5);
    const ks = pruebaKolmogorovSmirnov(datos, 0.05);
    expect(ks.rechazarH0).toBe(false);
  });

  it('datos fuertemente asimétricos rechazan normalidad', () => {
    const datos = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 6, 9, 15, 25, 40, 70];
    expect(pruebaAndersonDarling(datos, 0.05).rechazarH0).toBe(true);
  });

  it('Kruskal-Wallis sin empates: H = 7.2', () => {
    const prueba = pruebaKruskalWallis(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      0.05,
    );
    expect(prueba.H).toBeCloseTo(7.2, 10);
    expect(prueba.HCorregido).toBeCloseTo(7.2, 10);
  });

  it('Shapiro-Wilk está señalada como pendiente', () => {
    expect(() => pruebaShapiroWilk([1, 2, 3], 0.05)).toThrow(ErrorPendiente);
  });
});

describe('4.3 Análisis de varianza', () => {
  const grupos = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  it('ANOVA de un factor: SCTr = 54, SCE = 6, F = 27', () => {
    const anova = anovaUnFactor(grupos, 0.05);
    expect(anova.tabla[0].sumaCuadrados).toBeCloseTo(54, 10);
    expect(anova.tabla[1].sumaCuadrados).toBeCloseTo(6, 10);
    expect(anova.estadistico).toBeCloseTo(27, 10);
    expect(anova.valorCritico).toBeCloseTo(5.1433, 4);
    expect(anova.rechazarH0).toBe(true);
  });

  it('comparaciones múltiples LSD y Tukey', () => {
    const anova = anovaUnFactor(grupos, 0.05);
    const lsd = comparacionesLSD(anova, 0.05);
    expect(lsd.comparaciones).toHaveLength(3);
    expect(lsd.comparaciones[0].umbral).toBeCloseTo(2.4469 * Math.sqrt(2 / 3), 3);
    const tukey = comparacionesTukey(anova, 0.05);
    expect(tukey.valorCritico).toBeCloseTo(4.339, 3);
    expect(tukey.comparaciones.every((c) => c.significativa)).toBe(true);
    expect(tukey.comparaciones.every((c) => c.umbral > lsd.comparaciones[0].umbral)).toBe(true);
  });

  it('diseño de bloques: la suma de cuadrados se descompone por completo', () => {
    const datos = [
      [9.3, 9.4, 9.6, 10.0],
      [9.4, 9.3, 9.8, 9.9],
      [9.2, 9.4, 9.5, 9.7],
      [9.7, 9.6, 10.0, 10.2],
    ];
    const anova = anovaBloques(datos, 0.05);
    const [tratamientos, bloques, error, total] = anova.tabla;
    expect(tratamientos.sumaCuadrados + bloques.sumaCuadrados + error.sumaCuadrados).toBeCloseTo(total.sumaCuadrados, 10);
    expect(error.gl).toBe(9);
    expect(tratamientos.sumaCuadrados).toBeCloseTo(0.385, 3);
    expect(bloques.sumaCuadrados).toBeCloseTo(0.825, 3);
    expect(anova.efectoTratamiento.estadistico).toBeCloseTo(14.44, 2);
  });

  it('diseño factorial 2 x 3 con dos réplicas', () => {
    const celdas = [
      [
        [10, 12],
        [14, 16],
        [11, 13],
      ],
      [
        [20, 22],
        [15, 17],
        [18, 16],
      ],
    ];
    const anova = anovaFactorial(celdas, 0.05);
    const suma = anova.tabla.slice(0, 4).reduce((total, fila) => total + fila.sumaCuadrados, 0);
    expect(suma).toBeCloseTo(anova.tabla[4].sumaCuadrados, 10);
    expect(anova.glError).toBe(6);
    expect(anova.replicas).toBe(2);
  });
});

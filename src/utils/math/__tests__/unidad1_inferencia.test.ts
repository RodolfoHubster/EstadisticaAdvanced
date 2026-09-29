import { describe, expect, it } from 'vitest';
import {
  intervaloCocienteVarianzas,
  intervaloDiferenciaMediasT,
  intervaloMediaT,
  intervaloMediaZ,
  intervaloMuestrasPareadas,
  intervaloProporcion,
  intervaloVarianza,
  pruebaCocienteVarianzas,
  pruebaDiferenciaProporciones,
  pruebaMediaT,
  pruebaMediaZ,
  pruebaMuestrasPareadas,
} from '../unidad1_inferencia';
import { ErrorCalculo } from '../tipos';

describe('1.3 Inferencia sobre la media', () => {
  it('reproduce el ejemplo del prototipo de diseño: IC 95% = (51.03, 53.57)', () => {
    const ic = intervaloMediaZ({ n: 48, media: 52.3, desviacion: 4.5 }, 0.95);
    expect(ic.limiteInferior).toBeCloseTo(51.03, 2);
    expect(ic.limiteSuperior).toBeCloseTo(53.57, 2);
  });

  it('Walpole ej. 9.2: concentración de zinc, IC 95% y 99%', () => {
    const ic95 = intervaloMediaZ({ n: 36, media: 2.6, desviacion: 0.3 }, 0.95);
    expect(ic95.limiteInferior).toBeCloseTo(2.5, 2);
    expect(ic95.limiteSuperior).toBeCloseTo(2.7, 2);
    const ic99 = intervaloMediaZ({ n: 36, media: 2.6, desviacion: 0.3 }, 0.99);
    expect(ic99.limiteInferior).toBeCloseTo(2.47, 2);
    expect(ic99.limiteSuperior).toBeCloseTo(2.73, 2);
  });

  it('Walpole ej. 9.5: contenido de contenedores, IC 95% con t', () => {
    const ic = intervaloMediaT({ n: 7, media: 10, desviacion: 0.283 }, 0.95);
    expect(ic.valoresCriticos[0]).toBeCloseTo(2.447, 3);
    expect(ic.limiteInferior).toBeCloseTo(9.74, 2);
    expect(ic.limiteSuperior).toBeCloseTo(10.26, 2);
  });

  it('prueba Z de cola derecha: z = 2.02, P = 0.0217', () => {
    const prueba = pruebaMediaZ({ n: 100, media: 71.8, desviacion: 8.9 }, 70, { alfa: 0.05, tipo: 'derecha' });
    expect(prueba.estadistico).toBeCloseTo(2.02, 2);
    expect(prueba.valorP).toBeCloseTo(0.0217, 3);
    expect(prueba.rechazarH0).toBe(true);
  });

  it('prueba t de cola izquierda: t = -1.16, no se rechaza H0', () => {
    const prueba = pruebaMediaT({ n: 12, media: 42, desviacion: 11.9 }, 46, { alfa: 0.05, tipo: 'izquierda' });
    expect(prueba.estadistico).toBeCloseTo(-1.16, 2);
    expect(prueba.valorP).toBeGreaterThan(0.1);
    expect(prueba.valorP).toBeLessThan(0.15);
    expect(prueba.rechazarH0).toBe(false);
  });

  it('rechaza tamaños de muestra inválidos', () => {
    expect(() => intervaloMediaZ({ n: 1, media: 0, desviacion: 1 }, 0.95)).toThrow(ErrorCalculo);
  });
});

describe('1.4 y 1.7 Inferencia sobre proporciones', () => {
  it('IC 95% para p con n = 500 y x = 340', () => {
    const ic = intervaloProporcion({ n: 500, exitos: 340 }, 0.95);
    expect(ic.limiteInferior).toBeCloseTo(0.639, 3);
    expect(ic.limiteSuperior).toBeCloseTo(0.721, 3);
  });

  it('prueba de dos proporciones con proporción combinada', () => {
    const prueba = pruebaDiferenciaProporciones({ n: 200, exitos: 120 }, { n: 500, exitos: 240 }, { alfa: 0.05, tipo: 'bilateral' });
    expect(prueba.proporcionCombinada).toBeCloseTo(360 / 700, 10);
    expect(prueba.estadistico).toBeCloseTo(2.9, 1);
    expect(prueba.rechazarH0).toBe(true);
  });
});

describe('1.5 y 1.8 Inferencia sobre varianzas', () => {
  it('Walpole ej. 9.17: IC 95% para sigma^2 con s^2 = 0.286 y n = 10', () => {
    const ic = intervaloVarianza({ n: 10, varianza: 0.286 }, 0.95);
    expect(ic.limiteInferior).toBeCloseTo(0.135, 3);
    expect(ic.limiteSuperior).toBeCloseTo(0.953, 3);
  });

  it('el IC para sigma1^2/sigma2^2 contiene al cociente muestral', () => {
    const ic = intervaloCocienteVarianzas({ n: 15, varianza: 9.4249 }, { n: 12, varianza: 0.64 }, 0.98);
    expect(ic.limiteInferior).toBeLessThan(ic.estimador);
    expect(ic.limiteSuperior).toBeGreaterThan(ic.estimador);
    const prueba = pruebaCocienteVarianzas({ n: 15, varianza: 9.4249 }, { n: 12, varianza: 0.64 }, { alfa: 0.02, tipo: 'bilateral' });
    expect(prueba.rechazarH0).toBe(true);
  });
});

describe('1.6.2 Diferencia de medias con varianzas desconocidas', () => {
  it('varianza combinada con n1 + n2 - 2 grados de libertad', () => {
    const ic = intervaloDiferenciaMediasT({ n: 12, media: 85, desviacion: 4 }, { n: 10, media: 81, desviacion: 5 }, 0.9, true);
    expect(ic.gl).toBe(20);
    expect(ic.desviacionCombinada).toBeCloseTo(4.478, 3);
    expect(ic.limiteInferior).toBeCloseTo(0.69, 2);
    expect(ic.limiteSuperior).toBeCloseTo(7.31, 2);
  });

  it('Welch redondea hacia abajo los grados de libertad', () => {
    const ic = intervaloDiferenciaMediasT({ n: 15, media: 3.84, desviacion: 3.07 }, { n: 12, media: 1.49, desviacion: 0.8 }, 0.95, false);
    expect(ic.glExactos).toBeCloseTo(16.3, 1);
    expect(ic.gl).toBe(16);
  });
});

describe('1.9 Muestras pareadas', () => {
  const antes = [12, 15, 11, 18, 14, 16, 13];
  const despues = [10, 14, 11, 15, 12, 13, 12];

  it('calcula las diferencias y el intervalo', () => {
    const ic = intervaloMuestrasPareadas(antes, despues, 0.95);
    expect(ic.diferencias).toEqual([2, 1, 0, 3, 2, 3, 1]);
    expect(ic.mediaDiferencias).toBeCloseTo(12 / 7, 10);
    expect(ic.limiteInferior).toBeGreaterThan(0);
  });

  it('la prueba pareada rechaza H0: mu_D = 0', () => {
    const prueba = pruebaMuestrasPareadas(antes, despues, 0, { alfa: 0.05, tipo: 'bilateral' });
    expect(prueba.rechazarH0).toBe(true);
    expect(prueba.distribucion).toEqual({ tipo: 't', gl: 6 });
  });
});

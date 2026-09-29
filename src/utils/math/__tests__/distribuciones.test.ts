import { describe, expect, it } from 'vitest';
import {
  cdfNormal,
  cdfT,
  cuantilChiCuadrada,
  cuantilF,
  cuantilNormal,
  cuantilRangoEstudentizado,
  cuantilT,
  gammaRegularizadaP,
  sfChiCuadrada,
  sfF,
} from '../distribuciones';
import {
  TABLAS_CRITICAS,
  valorCriticoChiCuadrada,
  valorCriticoF,
  valorCriticoT,
  valorCriticoTukey,
} from '../consultaTablas';

describe('Distribución normal estándar', () => {
  it('reproduce los valores críticos de uso común', () => {
    expect(cuantilNormal(0.95)).toBeCloseTo(1.644854, 6);
    expect(cuantilNormal(0.975)).toBeCloseTo(1.959964, 6);
    expect(cuantilNormal(0.995)).toBeCloseTo(2.575829, 6);
  });

  it('concuerda con la definición mediante la función gamma incompleta', () => {
    for (const z of [0.1, 0.5, 1, 1.96, 2.5, 3.2]) {
      const referencia = 0.5 * (1 + gammaRegularizadaP(0.5, (z * z) / 2));
      expect(cdfNormal(z)).toBeCloseTo(referencia, 12);
    }
  });

  it('es la inversa de la función de distribución acumulada', () => {
    for (const p of [0.001, 0.025, 0.3, 0.5, 0.8, 0.999]) {
      expect(cdfNormal(cuantilNormal(p))).toBeCloseTo(p, 12);
    }
  });
});

describe('Distribuciones t, ji-cuadrada y F', () => {
  it('coincide con las tablas de Walpole et al. (2012)', () => {
    expect(cuantilT(0.975, 10)).toBeCloseTo(2.228, 3);
    expect(cuantilT(0.995, 5)).toBeCloseTo(4.032, 3);
    expect(cuantilChiCuadrada(0.95, 10)).toBeCloseTo(18.307, 3);
    expect(cuantilChiCuadrada(0.025, 9)).toBeCloseTo(2.7, 3);
    expect(cuantilF(0.95, 5, 10)).toBeCloseTo(3.33, 2);
    expect(cuantilF(0.99, 3, 20)).toBeCloseTo(4.94, 2);
  });

  it('la función t es simétrica', () => {
    expect(cdfT(1.5, 7) + cdfT(-1.5, 7)).toBeCloseTo(1, 12);
  });

  it('las funciones de supervivencia complementan a la acumulada', () => {
    expect(sfChiCuadrada(cuantilChiCuadrada(0.95, 4), 4)).toBeCloseTo(0.05, 10);
    expect(sfF(cuantilF(0.99, 4, 12), 4, 12)).toBeCloseTo(0.01, 10);
  });
});

describe('Rango estudentizado', () => {
  it('coincide con las tablas publicadas de Tukey', () => {
    expect(cuantilRangoEstudentizado(0.95, 3, 10)).toBeCloseTo(3.877, 2);
    expect(cuantilRangoEstudentizado(0.95, 5, 20)).toBeCloseTo(4.232, 2);
    expect(cuantilRangoEstudentizado(0.99, 3, 10)).toBeCloseTo(5.27, 2);
  });

  it('para k = 2 equivale a raíz de 2 por el cuantil t', () => {
    expect(cuantilRangoEstudentizado(0.95, 2, 12)).toBeCloseTo(Math.SQRT2 * cuantilT(0.975, 12), 3);
  });
});

describe('tablasCriticas.json', () => {
  it('es consistente con el motor de distribuciones', () => {
    const { tStudent, chiCuadrada, fisher } = TABLAS_CRITICAS;
    tStudent.filas
      .filter((fila) => fila.gl !== 'inf')
      .forEach((fila) =>
        fila.valores.forEach((valor, j) => expect(valor).toBeCloseTo(cuantilT(1 - tStudent.alfas[j], fila.gl as number), 3)),
      );
    chiCuadrada.filas.forEach((fila) =>
      fila.valores.forEach((valor, j) =>
        expect(valor).toBeCloseTo(cuantilChiCuadrada(1 - chiCuadrada.alfas[j], fila.gl as number), 3),
      ),
    );
    const f05 = fisher[0];
    f05.filas.slice(0, 10).forEach((fila) =>
      fila.valores.forEach((valor, j) => expect(valor).toBeCloseTo(cuantilF(0.95, f05.gl1[j], fila.gl2 as number), 3)),
    );
  });

  it('indica el origen del valor crítico consultado', () => {
    expect(valorCriticoT(0.025, 10)).toEqual({ valor: 2.2281, origen: 'tabla' });
    expect(valorCriticoChiCuadrada(0.05, 10).origen).toBe('tabla');
    expect(valorCriticoF(0.05, 5, 10).valor).toBeCloseTo(3.3258, 4);
    expect(valorCriticoTukey(0.05, 3, 10).valor).toBeCloseTo(3.877, 3);
    const calculado = valorCriticoT(0.025, 45);
    expect(calculado.origen).toBe('motor');
    expect(calculado.valor).toBeCloseTo(2.0141, 4);
  });
});

import { describe, expect, it } from 'vitest';
import { crearFormateador } from '../../../../utils/formato';
import { CALCULADORAS } from '..';
import { ErrorCampo } from '../lectura';

const f = crearFormateador(4);

describe('Registro de calculadoras', () => {
  it('cada identificador es único', () => {
    const ids = CALCULADORAS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('los valores iniciales cubren todos los campos capturables', () => {
    for (const calculadora of CALCULADORAS) {
      for (const campo of calculadora.campos) {
        if (campo.tipo !== 'separador') expect(calculadora.valoresIniciales, `${calculadora.id}.${campo.id}`).toHaveProperty(campo.id);
      }
    }
  });

  for (const calculadora of CALCULADORAS) {
    const modos = calculadora.campos.some((c) => c.id === 'modo') ? ['intervalo', 'prueba'] : [undefined];
    for (const modo of modos) {
      it(`${calculadora.id}${modo ? ` (${modo})` : ''}: el ejemplo produce un resultado completo`, () => {
        const valores = modo ? { ...calculadora.ejemplo.valores, modo } : calculadora.ejemplo.valores;
        const resultado = calculadora.calcular(valores);
        expect(resultado.etiqueta.length).toBeGreaterThan(0);
        expect(resultado.metricas.length).toBeGreaterThan(0);
        resultado.metricas.forEach((m) => {
          if (typeof m.valor === 'number') expect(Number.isNaN(m.valor), `${calculadora.id}: ${m.etiqueta}`).toBe(false);
        });
        expect(() => resultado.interpretacion?.(f)).not.toThrow();
        expect(() => resultado.decision?.texto(f)).not.toThrow();
      });
    }
  }

  it('los valores vacíos generan un error asociado a un campo', () => {
    for (const calculadora of CALCULADORAS) {
      expect(() => calculadora.calcular(calculadora.valoresIniciales), calculadora.id).toThrow(ErrorCampo);
    }
  });

  it('el ejemplo de §1.3.1 reproduce el prototipo de diseño', () => {
    const calculadora = CALCULADORAS.find((c) => c.id === 'media-muestra-grande')!;
    const resultado = calculadora.calcular(calculadora.ejemplo.valores);
    expect(resultado.principal).toMatchObject({ tipo: 'intervalo' });
    if (resultado.principal.tipo === 'intervalo') {
      expect(resultado.principal.inferior).toBeCloseTo(51.03, 2);
      expect(resultado.principal.superior).toBeCloseTo(53.57, 2);
    }
  });

  it('los ejemplos de Montgomery reproducen los estadísticos F publicados', () => {
    const unFactor = CALCULADORAS.find((c) => c.id === 'anova-un-factor')!.calcular(
      CALCULADORAS.find((c) => c.id === 'anova-un-factor')!.ejemplo.valores,
    );
    expect(unFactor.principal).toMatchObject({ valor: expect.closeTo(66.8, 1) });
    const bloques = CALCULADORAS.find((c) => c.id === 'anova-bloques')!;
    expect(bloques.calcular(bloques.ejemplo.valores).principal).toMatchObject({ valor: expect.closeTo(14.44, 2) });
    const factorial = CALCULADORAS.find((c) => c.id === 'anova-factorial')!;
    expect(factorial.calcular(factorial.ejemplo.valores).principal).toMatchObject({ valor: expect.closeTo(3.56, 2) });
  });

  it('el ejemplo de independencia reproduce chi2 aproximado de 7.85 del texto', () => {
    const calculadora = CALCULADORAS.find((c) => c.id === 'tabla-contingencia')!;
    expect(calculadora.calcular(calculadora.ejemplo.valores).principal).toMatchObject({ valor: expect.closeTo(7.85, 0) });
  });
});

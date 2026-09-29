/**
 * Representación de notación matemática en línea.
 * Sintaxis: subíndices con _{...} y superíndices con ^{...}, anidables.
 * Ejemplo: "χ^{2}_{α/2}" o "x̄ ± z_{α/2} · σ/√n".
 */
import type { ReactNode } from 'react';
import { cx } from '../../utils/clases';

function cierreCorrespondiente(texto: string, apertura: number): number {
  let profundidad = 0;
  for (let i = apertura; i < texto.length; i++) {
    if (texto[i] === '{') profundidad++;
    else if (texto[i] === '}') {
      profundidad--;
      if (profundidad === 0) return i;
    }
  }
  return texto.length;
}

function analizar(texto: string, prefijo: string): ReactNode[] {
  const nodos: ReactNode[] = [];
  let acumulado = '';
  let i = 0;
  while (i < texto.length) {
    const caracter = texto[i];
    if ((caracter === '_' || caracter === '^') && texto[i + 1] === '{') {
      const cierre = cierreCorrespondiente(texto, i + 1);
      if (acumulado) {
        nodos.push(acumulado);
        acumulado = '';
      }
      const interior = analizar(texto.slice(i + 2, cierre), `${prefijo}-${i}`);
      nodos.push(caracter === '_' ? <sub key={`${prefijo}-${i}`}>{interior}</sub> : <sup key={`${prefijo}-${i}`}>{interior}</sup>);
      i = cierre + 1;
    } else {
      acumulado += caracter;
      i++;
    }
  }
  if (acumulado) nodos.push(acumulado);
  return nodos;
}

interface FormulaProps {
  expresion: string;
  className?: string;
  /** Muestra la expresión como bloque destacado. */
  bloque?: boolean;
}

export function Formula({ expresion, className, bloque = false }: FormulaProps) {
  const Elemento = bloque ? 'div' : 'span';
  return (
    <Elemento className={cx('font-mono', bloque && 'whitespace-pre-wrap break-words', className)}>
      {analizar(expresion, 'f')}
    </Elemento>
  );
}

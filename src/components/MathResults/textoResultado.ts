import type { Formateador } from '../../utils/formato';
import type { ValorPrincipal } from './tipos';

const SUBINDICES: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', a: 'ₐ', e: 'ₑ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', n: 'ₙ', o: 'ₒ', p: 'ₚ', x: 'ₓ',
};

const SUPERINDICES: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', T: 'ᵀ',
};

function convertir(contenido: string, tabla: Record<string, string>): string {
  const caracteres = [...contenido];
  return caracteres.every((c) => c in tabla) ? caracteres.map((c) => tabla[c]).join('') : contenido;
}

/**
 * Convierte la sintaxis _{ } y ^{ } a texto plano, usando caracteres Unicode de
 * subíndice y superíndice cuando existen (por ejemplo, "μ_{0}" -> "μ₀").
 */
export function notacionPlana(expresion: string): string {
  return expresion
    .replace(/_\{([^{}]*)\}/g, (_, contenido: string) => convertir(contenido, SUBINDICES))
    .replace(/\^\{([^{}]*)\}/g, (_, contenido: string) => convertir(contenido, SUPERINDICES));
}

/** Texto plano del resultado principal (también se usa en el historial de la sesión). */
export function textoPrincipal(principal: ValorPrincipal, f: Formateador): string {
  switch (principal.tipo) {
    case 'intervalo':
      return `(${f(principal.inferior)}, ${f(principal.superior)})`;
    case 'numero':
      return principal.simbolo ? `${notacionPlana(principal.simbolo)} = ${f(principal.valor)}` : f(principal.valor);
    case 'ecuacion':
      return `${principal.respuesta} = ${principal.terminos
        .map((termino, i) => {
          const magnitud = f(i === 0 ? termino.coeficiente : Math.abs(termino.coeficiente));
          const signo = i === 0 ? '' : termino.coeficiente < 0 ? ' − ' : ' + ';
          return `${signo}${magnitud}${termino.variable ? ` ${termino.variable}` : ''}`;
        })
        .join('')}`;
  }
}

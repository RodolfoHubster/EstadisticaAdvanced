/** Utilidades de escalado y marcas de eje para las gráficas SVG. */

export type Escala = (valor: number) => number;

export function escalaLineal([d0, d1]: [number, number], [r0, r1]: [number, number]): Escala {
  const pendiente = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (valor) => r0 + (valor - d0) * pendiente;
}

/** Marcas de eje "redondas" (múltiplos de 1, 2 o 5 por potencias de diez). */
export function marcasEje(minimo: number, maximo: number, cantidad = 6): number[] {
  if (!Number.isFinite(minimo) || !Number.isFinite(maximo)) return [];
  if (minimo === maximo) {
    minimo -= 1;
    maximo += 1;
  }
  const pasoBruto = (maximo - minimo) / cantidad;
  const magnitud = 10 ** Math.floor(Math.log10(pasoBruto));
  const residuo = pasoBruto / magnitud;
  const paso = (residuo < 1.5 ? 1 : residuo < 3 ? 2 : residuo < 7 ? 5 : 10) * magnitud;
  const marcas: number[] = [];
  for (let valor = Math.ceil(minimo / paso) * paso; valor <= maximo + paso * 1e-9; valor += paso) {
    marcas.push(Number(valor.toPrecision(12)));
  }
  return marcas;
}

/** Etiqueta compacta para marcas de eje. */
export function etiquetaMarca(valor: number): string {
  if (valor === 0) return '0';
  const absoluto = Math.abs(valor);
  if (absoluto >= 1e5 || absoluto < 1e-3) return valor.toExponential(1);
  return String(Number(valor.toPrecision(4)));
}

/** Amplía un dominio en una fracción de su rango a cada lado. */
export function ampliarDominio(minimo: number, maximo: number, fraccion = 0.08): [number, number] {
  const rango = maximo - minimo || Math.abs(minimo) || 1;
  return [minimo - rango * fraccion, maximo + rango * fraccion];
}

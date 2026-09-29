/**
 * Lectura y validación de los valores capturados en los formularios.
 * Cada error identifica el campo que lo originó para mostrarlo junto a él.
 */
import type { FormatoDatos, ValoresFormulario } from './tipos';

export class ErrorCampo extends Error {
  readonly campo: string;

  constructor(campo: string, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorCampo';
    this.campo = campo;
  }
}

const PATRON_NUMERO = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;

function aNumero(texto: string): number | null {
  const limpio = texto.trim().replace(/^−/, '-');
  return PATRON_NUMERO.test(limpio) ? Number(limpio) : null;
}

interface OpcionesNumero {
  etiqueta: string;
  entero?: boolean;
  minimo?: number;
  /** Si es verdadero, el mínimo se excluye (valor > minimo). */
  minimoExclusivo?: boolean;
  maximo?: number;
}

function validarNumero(id: string, valor: number, opciones: OpcionesNumero): number {
  const { etiqueta, entero, minimo, minimoExclusivo, maximo } = opciones;
  if (entero && !Number.isInteger(valor)) throw new ErrorCampo(id, `${etiqueta} debe ser un número entero.`);
  if (minimo !== undefined) {
    if (minimoExclusivo ? valor <= minimo : valor < minimo) {
      throw new ErrorCampo(id, `${etiqueta} debe ser ${minimoExclusivo ? 'mayor que' : 'mayor o igual que'} ${minimo}.`);
    }
  }
  if (maximo !== undefined && valor > maximo) throw new ErrorCampo(id, `${etiqueta} debe ser menor o igual que ${maximo}.`);
  return valor;
}

export function leerNumero(valores: ValoresFormulario, id: string, opciones: OpcionesNumero): number {
  const texto = (valores[id] ?? '').trim();
  if (texto === '') throw new ErrorCampo(id, `Capture ${opciones.etiqueta.toLowerCase()}.`);
  const valor = aNumero(texto);
  if (valor === null) throw new ErrorCampo(id, `"${texto}" no es un número válido. Use punto decimal.`);
  return validarNumero(id, valor, opciones);
}

export function leerNumeroOpcional(valores: ValoresFormulario, id: string, opciones: OpcionesNumero): number | undefined {
  return (valores[id] ?? '').trim() === '' ? undefined : leerNumero(valores, id, opciones);
}

/** Nivel de confianza expresado en porcentaje (95) o como proporción (0.95). */
export function leerConfianza(valores: ValoresFormulario, id = 'confianza'): number {
  const valor = leerNumero(valores, id, { etiqueta: 'El nivel de confianza', minimo: 0, minimoExclusivo: true });
  const proporcion = valor > 1 ? valor / 100 : valor;
  if (!(proporcion > 0 && proporcion < 1)) {
    throw new ErrorCampo(id, 'El nivel de confianza debe estar entre 0 y 100% (exclusivo).');
  }
  return proporcion;
}

/** Nivel de significancia expresado como proporción (0.05) o en porcentaje (5). */
export function leerAlfa(valores: ValoresFormulario, id = 'alfa'): number {
  const valor = leerNumero(valores, id, { etiqueta: 'El nivel de significancia', minimo: 0, minimoExclusivo: true });
  const proporcion = valor >= 1 ? valor / 100 : valor;
  if (!(proporcion > 0 && proporcion < 0.5)) {
    throw new ErrorCampo(id, 'El nivel de significancia debe estar entre 0 y 0.5.');
  }
  return proporcion;
}

function lineas(texto: string): { numero: number; contenido: string }[] {
  return texto
    .split(/\r?\n/)
    .map((contenido, i) => ({ numero: i + 1, contenido: contenido.trim() }))
    .filter((linea) => linea.contenido !== '');
}

function fichas(texto: string): string[] {
  return texto.split(/[\s,;]+/).filter(Boolean);
}

function numerosDeFichas(id: string, fichasTexto: string[], contexto: string): number[] {
  return fichasTexto.map((ficha) => {
    const valor = aNumero(ficha);
    if (valor === null) throw new ErrorCampo(id, `${contexto}: "${ficha}" no es un valor numérico.`);
    return valor;
  });
}

interface OpcionesDatos {
  etiqueta: string;
  minimo?: number;
  enteros?: boolean;
  noNegativos?: boolean;
}

function validarValores(id: string, datos: number[], opciones: OpcionesDatos): void {
  if (opciones.enteros && datos.some((v) => !Number.isInteger(v))) {
    throw new ErrorCampo(id, `${opciones.etiqueta}: todos los valores deben ser enteros.`);
  }
  if (opciones.noNegativos && datos.some((v) => v < 0)) {
    throw new ErrorCampo(id, `${opciones.etiqueta}: los valores no pueden ser negativos.`);
  }
}

/** Lista de números separados por espacios, comas, punto y coma o saltos de línea. */
export function leerVector(valores: ValoresFormulario, id: string, opciones: OpcionesDatos): number[] {
  const datos = numerosDeFichas(id, fichas(valores[id] ?? ''), opciones.etiqueta);
  const minimo = opciones.minimo ?? 1;
  if (datos.length < minimo) {
    throw new ErrorCampo(id, `${opciones.etiqueta}: se requieren al menos ${minimo} valores (capturados: ${datos.length}).`);
  }
  validarValores(id, datos, opciones);
  return datos;
}

export function leerVectorOpcional(valores: ValoresFormulario, id: string, opciones: OpcionesDatos): number[] | undefined {
  return (valores[id] ?? '').trim() === '' ? undefined : leerVector(valores, id, opciones);
}

/**
 * Matriz rectangular: una fila por línea. Si `permitirEncabezado` es verdadero y la
 * primera línea contiene texto, se interpreta como nombres de columna. Cada fila puede
 * iniciar con una etiqueta seguida de dos puntos ("Nombre: valores").
 */
export function leerMatriz(
  valores: ValoresFormulario,
  id: string,
  opciones: OpcionesDatos & { columnasMinimas?: number; filasMinimas?: number; permitirEncabezado?: boolean },
): { encabezados?: string[]; etiquetasFila: string[]; filas: number[][] } {
  let renglones = lineas(valores[id] ?? '');
  let encabezados: string[] | undefined;
  if (
    opciones.permitirEncabezado &&
    renglones.length > 0 &&
    !renglones[0].contenido.includes(':') &&
    fichas(renglones[0].contenido).some((f) => aNumero(f) === null)
  ) {
    encabezados = fichas(renglones[0].contenido);
    renglones = renglones.slice(1);
  }
  const etiquetasFila: string[] = [];
  const filas = renglones.map((linea, i) => {
    const { nombre, resto } = separarNombre(linea.contenido, i, 'Fila');
    etiquetasFila.push(nombre);
    return numerosDeFichas(id, fichas(resto), `Línea ${linea.numero}`);
  });
  const filasMinimas = opciones.filasMinimas ?? 2;
  if (filas.length < filasMinimas) {
    throw new ErrorCampo(id, `${opciones.etiqueta}: se requieren al menos ${filasMinimas} filas de datos.`);
  }
  const columnas = filas[0].length;
  if (columnas < (opciones.columnasMinimas ?? 1)) {
    throw new ErrorCampo(id, `${opciones.etiqueta}: se requieren al menos ${opciones.columnasMinimas} columnas.`);
  }
  const irregular = renglones.find((_, i) => filas[i].length !== columnas);
  if (irregular) {
    throw new ErrorCampo(id, `Línea ${irregular.numero}: se esperaban ${columnas} valores, como en la primera fila.`);
  }
  if (encabezados && encabezados.length !== columnas) {
    throw new ErrorCampo(id, `El encabezado tiene ${encabezados.length} nombres, pero los datos tienen ${columnas} columnas.`);
  }
  validarValores(id, filas.flat(), opciones);
  return { encabezados, etiquetasFila, filas };
}

function separarNombre(contenido: string, indice: number, prefijo: string): { nombre: string; resto: string } {
  const separador = contenido.indexOf(':');
  if (separador > 0) {
    return { nombre: contenido.slice(0, separador).trim(), resto: contenido.slice(separador + 1) };
  }
  return { nombre: `${prefijo} ${indice + 1}`, resto: contenido };
}

/** Grupos de observaciones: una línea por grupo, con nombre opcional "Nombre: valores". */
export function leerGrupos(
  valores: ValoresFormulario,
  id: string,
  opciones: OpcionesDatos & { minimoGrupos?: number; prefijo?: string },
): { nombres: string[]; grupos: number[][] } {
  const renglones = lineas(valores[id] ?? '');
  const minimoGrupos = opciones.minimoGrupos ?? 2;
  if (renglones.length < minimoGrupos) {
    throw new ErrorCampo(id, `${opciones.etiqueta}: capture al menos ${minimoGrupos} grupos, uno por línea.`);
  }
  const nombres: string[] = [];
  const grupos = renglones.map((linea, i) => {
    const { nombre, resto } = separarNombre(linea.contenido, i, opciones.prefijo ?? 'Grupo');
    nombres.push(nombre);
    const datos = numerosDeFichas(id, fichas(resto), `Línea ${linea.numero}`);
    if (datos.length === 0) throw new ErrorCampo(id, `Línea ${linea.numero}: el grupo "${nombre}" no tiene datos.`);
    return datos;
  });
  validarValores(id, grupos.flat(), opciones);
  return { nombres, grupos };
}

/**
 * Diseño factorial: una línea por nivel del factor A; las celdas (niveles de B) se
 * separan con "|" y cada celda contiene sus réplicas.
 */
export function leerFactorial(
  valores: ValoresFormulario,
  id: string,
  opciones: OpcionesDatos,
): { nombresA: string[]; celdas: number[][][] } {
  const renglones = lineas(valores[id] ?? '');
  if (renglones.length < 2) throw new ErrorCampo(id, `${opciones.etiqueta}: capture al menos dos niveles del factor A.`);
  const nombresA: string[] = [];
  const celdas = renglones.map((linea, i) => {
    const { nombre, resto } = separarNombre(linea.contenido, i, 'A');
    nombresA.push(nombre);
    return resto.split('|').map((celda, j) => {
      const datos = numerosDeFichas(id, fichas(celda), `Línea ${linea.numero}, celda ${j + 1}`);
      if (datos.length === 0) throw new ErrorCampo(id, `Línea ${linea.numero}: la celda ${j + 1} está vacía.`);
      return datos;
    });
  });
  validarValores(id, celdas.flat(2), opciones);
  return { nombresA, celdas };
}

/** Descripción breve del contenido capturado, mostrada bajo el área de datos. */
export function describirDatos(formato: FormatoDatos, texto: string): string | undefined {
  if (texto.trim() === '') return undefined;
  try {
    const valores = { campo: texto };
    switch (formato) {
      case 'vector':
        return `n = ${leerVector(valores, 'campo', { etiqueta: 'Datos', minimo: 1 }).length}`;
      case 'matriz': {
        const { filas, encabezados } = leerMatriz(valores, 'campo', { etiqueta: 'Datos', filasMinimas: 1, permitirEncabezado: true });
        return `${filas.length} × ${filas[0].length}${encabezados ? ' · con encabezado' : ''}`;
      }
      case 'grupos': {
        const { grupos } = leerGrupos(valores, 'campo', { etiqueta: 'Datos', minimoGrupos: 1 });
        return `${grupos.length} grupos · N = ${grupos.reduce((total, g) => total + g.length, 0)}`;
      }
      case 'factorial': {
        const { celdas } = leerFactorial(valores, 'campo', { etiqueta: 'Datos' });
        return `${celdas.length} × ${celdas[0].length} celdas`;
      }
    }
  } catch {
    return undefined;
  }
}

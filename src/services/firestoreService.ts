/**
 * Acceso a datos en Firestore.
 *
 * Colecciones:
 * - `glosario`: términos del glosario (lectura pública).
 * - `historial`: registro anónimo de cálculos por sesión, sin datos personales.
 *
 * Todas las operaciones degradan de forma controlada al catálogo local cuando
 * Firebase no está configurado o la red no está disponible.
 */
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { GLOSARIO_LOCAL, type TerminoGlosario } from '../data/glosario';
import type { NumeroUnidad } from '../data/temario';
import { db } from './firebaseConfig';

const COLECCION_GLOSARIO = 'glosario';
const COLECCION_HISTORIAL = 'historial';

export type OrigenDatos = 'firestore' | 'local';

export interface RespuestaGlosario {
  terminos: TerminoGlosario[];
  origen: OrigenDatos;
  /** Descripción del motivo por el que se recurrió al catálogo local, si aplica. */
  aviso?: string;
}

function esUnidad(valor: unknown): valor is NumeroUnidad {
  return valor === 1 || valor === 2 || valor === 3 || valor === 4;
}

/** Valida y normaliza un documento de la colección `glosario`. */
function aTermino(id: string, datos: Record<string, unknown>): TerminoGlosario | null {
  const { termino, definicion, unidad, seccion, simbolo } = datos;
  if (typeof termino !== 'string' || typeof definicion !== 'string' || !esUnidad(unidad) || typeof seccion !== 'string') {
    return null;
  }
  return {
    id,
    termino,
    definicion,
    unidad,
    seccion,
    simbolo: typeof simbolo === 'string' ? simbolo : undefined,
  };
}

/** Obtiene el glosario desde Firestore; si no es posible, devuelve el catálogo local. */
export async function obtenerGlosario(): Promise<RespuestaGlosario> {
  if (!db) {
    return { terminos: GLOSARIO_LOCAL, origen: 'local' };
  }
  try {
    const instantanea = await getDocs(query(collection(db, COLECCION_GLOSARIO), orderBy('termino')));
    const terminos = instantanea.docs
      .map((documento) => aTermino(documento.id, documento.data()))
      .filter((termino): termino is TerminoGlosario => termino !== null);
    if (terminos.length === 0) {
      return {
        terminos: GLOSARIO_LOCAL,
        origen: 'local',
        aviso: 'La colección "glosario" está vacía; se muestra el catálogo local.',
      };
    }
    return { terminos, origen: 'firestore' };
  } catch (error) {
    return {
      terminos: GLOSARIO_LOCAL,
      origen: 'local',
      aviso: `No fue posible consultar Firestore (${error instanceof Error ? error.message : 'error desconocido'}).`,
    };
  }
}

/**
 * Publica el catálogo local en la colección `glosario`, conservando los identificadores.
 * Utilidad administrativa para poblar la base de datos por primera vez.
 */
export async function publicarGlosarioLocal(): Promise<number> {
  if (!db) throw new Error('Firebase no está configurado. Revise src/services/firebaseConfig.ts.');
  const lote = writeBatch(db);
  for (const { id, ...datos } of GLOSARIO_LOCAL) {
    const registro = Object.fromEntries(Object.entries(datos).filter(([, valor]) => valor !== undefined));
    lote.set(doc(db, COLECCION_GLOSARIO, id), registro);
  }
  await lote.commit();
  return GLOSARIO_LOCAL.length;
}

export interface RegistroCalculo {
  /** Identificador anónimo de la sesión del navegador. */
  sesion: string;
  calculadora: string;
  unidad: NumeroUnidad;
  resumen: string;
}

/** Registra un cálculo en el historial remoto. No lanza excepciones: devuelve si tuvo éxito. */
export async function registrarCalculo(registro: RegistroCalculo): Promise<boolean> {
  if (!db) return false;
  try {
    await addDoc(collection(db, COLECCION_HISTORIAL), { ...registro, creado: serverTimestamp() });
    return true;
  } catch {
    return false;
  }
}

/** Consulta los cálculos más recientes de una sesión. */
export async function obtenerHistorialSesion(sesion: string, maximo = 20): Promise<RegistroCalculo[]> {
  if (!db) return [];
  const instantanea = await getDocs(
    query(collection(db, COLECCION_HISTORIAL), where('sesion', '==', sesion), orderBy('creado', 'desc'), limit(maximo)),
  );
  return instantanea.docs.map((documento) => documento.data() as RegistroCalculo);
}

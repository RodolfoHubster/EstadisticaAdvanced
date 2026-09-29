/**
 * Historial de cálculos de la sesión actual del navegador (requerimiento de la fase 1:
 * sin cuentas de usuario). Se conserva en sessionStorage y se comparte entre vistas
 * mediante un almacén suscribible.
 */
import { useSyncExternalStore } from 'react';
import type { NumeroUnidad } from '../data/temario';

export interface EntradaHistorial {
  id: string;
  calculadora: string;
  titulo: string;
  seccion: string;
  unidad: NumeroUnidad;
  resumen: string;
  fecha: number;
}

const CLAVE_HISTORIAL = 'estadistica-avanzada:historial';
const CLAVE_SESION = 'estadistica-avanzada:sesion';
const MAXIMO_ENTRADAS = 25;

const suscriptores = new Set<() => void>();
let entradas: EntradaHistorial[] = leerAlmacenamiento();

function leerAlmacenamiento(): EntradaHistorial[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE_HISTORIAL);
    const datos: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? (datos as EntradaHistorial[]) : [];
  } catch {
    return [];
  }
}

function persistir(): void {
  try {
    sessionStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(entradas));
  } catch {
    // El historial se mantiene en memoria si el almacenamiento no está disponible.
  }
}

function notificar(): void {
  suscriptores.forEach((suscriptor) => suscriptor());
}

function suscribir(suscriptor: () => void): () => void {
  suscriptores.add(suscriptor);
  return () => suscriptores.delete(suscriptor);
}

function generarId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Identificador anónimo y estable de la sesión del navegador. */
export function obtenerIdSesion(): string {
  try {
    let id = sessionStorage.getItem(CLAVE_SESION);
    if (!id) {
      id = generarId();
      sessionStorage.setItem(CLAVE_SESION, id);
    }
    return id;
  } catch {
    return 'sesion-sin-almacenamiento';
  }
}

export function agregarAlHistorial(entrada: Omit<EntradaHistorial, 'id' | 'fecha'>): void {
  entradas = [{ ...entrada, id: generarId(), fecha: Date.now() }, ...entradas].slice(0, MAXIMO_ENTRADAS);
  persistir();
  notificar();
}

export function limpiarHistorial(): void {
  entradas = [];
  persistir();
  notificar();
}

export function useHistorialSesion(): EntradaHistorial[] {
  return useSyncExternalStore(suscribir, () => entradas);
}

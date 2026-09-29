/**
 * Inicialización del SDK modular de Firebase (v9 o superior).
 *
 * Sustituya cada valor del objeto `firebaseConfig` por las credenciales del proyecto
 * (Consola de Firebase > Configuración del proyecto > Tus apps > SDK de Firebase).
 * Mientras los valores conserven el prefijo "TU_", la aplicación funciona con el
 * catálogo local y no intenta conectarse a Firestore.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_PROYECTO.firebaseapp.com',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_PROYECTO.appspot.com',
  messagingSenderId: 'TU_MESSAGING_SENDER_ID',
  appId: 'TU_APP_ID',
};

/** Indica si el objeto de configuración ya contiene credenciales reales. */
export const firebaseConfigurado = Object.values(firebaseConfig).every(
  (valor) => valor.trim() !== '' && !valor.startsWith('TU_'),
);

export const app: FirebaseApp | null = firebaseConfigurado ? initializeApp(firebaseConfig) : null;

export const db: Firestore | null = app ? getFirestore(app) : null;

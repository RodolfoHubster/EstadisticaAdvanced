/**
 * Panel académico: selector de unidades, indicadores del sistema, accesos rápidos
 * e historial de la sesión.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tarjeta } from '../../components/Cards/Tarjeta';
import { TarjetaHistorial } from '../../components/Cards/TarjetaHistorial';
import { TarjetaUnidad } from '../../components/Cards/TarjetaUnidad';
import { Icono } from '../../components/Iconos/Icono';
import { EncabezadoPagina } from '../../components/Layout/EncabezadoPagina';
import { FORMULARIO } from '../../data/formulario';
import { GLOSARIO_LOCAL } from '../../data/glosario';
import { HORAS_TOTALES, UNIDADES } from '../../data/temario';
import { useHistorialSesion } from '../../hooks/useHistorialSesion';
import { TABLAS_CRITICAS } from '../../utils/math/consultaTablas';
import { CALCULADORAS, calculadorasDeUnidad } from '../Calculadoras/definiciones';

const ACCESOS_RAPIDOS = ['media-muestra-grande', 'media-muestra-pequena', 'regresion-simple', 'regresion-multiple', 'tabla-contingencia', 'anova-un-factor'];

const HOJA_DE_RUTA = [
  { titulo: 'Panel docente', detalle: 'Banco de ejercicios propio y revisión del historial del grupo.' },
  { titulo: 'Panel del alumno', detalle: 'Historial personal y progreso por unidad.' },
  { titulo: 'Modo oscuro', detalle: 'Mismos tokens de diseño con paleta invertida.' },
  { titulo: 'Shapiro-Wilk y Dunnett', detalle: 'Técnicas de la Unidad IV pendientes de implementación.' },
];

function Indicador({ valor, etiqueta, detalle }: { valor: string; etiqueta: string; detalle: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="font-mono text-[1.9rem] font-semibold leading-none tracking-tight text-uabc-verde cifra">{valor}</p>
      <p className="mt-2 text-sm font-medium text-tinta">{etiqueta}</p>
      <p className="text-xs text-tinta-secundaria">{detalle}</p>
    </div>
  );
}

export default function Dashboard() {
  const historial = useHistorialSesion();
  const [firebaseConfigurado, setFirebaseConfigurado] = useState<boolean | null>(null);
  const accesos = ACCESOS_RAPIDOS.map((id) => CALCULADORAS.find((c) => c.id === id)).filter((c) => c !== undefined);

  // El SDK de Firebase se carga después del primer render para no demorar el panel.
  useEffect(() => {
    let vigente = true;
    import('../../services/firebaseConfig')
      .then((modulo) => vigente && setFirebaseConfigurado(modulo.firebaseConfigurado))
      .catch(() => vigente && setFirebaseConfigurado(false));
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <>
      <EncabezadoPagina
        etiqueta="Panel académico"
        titulo="Sistema de Apoyo Digital para Estadística Avanzada"
        descripcion={
          <p>
            Desarrollar modelos de fenómenos de interés para la ingeniería de software a partir de un análisis muestral y de la
            aplicación de técnicas de la estadística inferencial, para facilitar la toma de decisiones en el diseño de aplicaciones.
          </p>
        }
        acciones={
          <>
            <Link to="/calculadoras" className="boton-primario">
              <Icono nombre="calculadora" className="h-4 w-4" />
              Abrir calculadoras
            </Link>
            <Link to="/glosario" className="boton-secundario">
              <Icono nombre="libro" className="h-4 w-4" />
              Glosario
            </Link>
          </>
        }
      />

      <section
        aria-label="Indicadores del sistema"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-tarjeta bg-fondo shadow-tarjeta ring-1 ring-black/[0.035] lg:grid-cols-4"
      >
        <Indicador valor={String(UNIDADES.length)} etiqueta="Unidades de aprendizaje" detalle="PUA plan 2021-2" />
        <Indicador valor={`${HORAS_TOTALES} h`} etiqueta="Contenido del temario" detalle="8 · 6 · 8 · 10 horas por unidad" />
        <Indicador valor={String(CALCULADORAS.length)} etiqueta="Calculadoras interactivas" detalle="Ejecución local en el navegador" />
        <Indicador valor={String(GLOSARIO_LOCAL.length)} etiqueta="Términos del glosario" detalle="Organizados por unidad y tema" />
      </section>

      <section className="mt-10" aria-labelledby="titulo-unidades">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="etiqueta-seccion">Selector de unidad</p>
            <h2 id="titulo-unidades" className="mt-1 text-xl font-semibold text-uabc-verde-noche">
              Unidades del temario
            </h2>
          </div>
          <p className="hidden text-sm text-tinta-secundaria md:block">Cada unidad integra glosario, fórmulas y calculadoras.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {UNIDADES.map((unidad) => (
            <TarjetaUnidad
              key={unidad.numero}
              unidad={unidad}
              conteos={{
                glosario: GLOSARIO_LOCAL.filter((t) => t.unidad === unidad.numero).length,
                formulas: FORMULARIO.filter((f) => f.unidad === unidad.numero).length,
                calculadoras: calculadorasDeUnidad(unidad.numero).length,
              }}
            />
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <Tarjeta etiqueta="Acceso rápido" titulo="Calculadoras de uso frecuente" icono="calculadora" className="lg:col-span-2" cuerpoClassName="p-0">
          <ul className="grid divide-y divide-fondo sm:grid-cols-2 sm:divide-y-0">
            {accesos.map((calculadora) => (
              <li key={calculadora.id} className="sm:border-b sm:border-fondo sm:odd:border-r">
                <Link
                  to={`/calculadoras/${calculadora.id}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-uabc-verde-tenue/60 sm:px-6"
                >
                  <span className="w-16 shrink-0 font-mono text-[11px] text-tinta-secundaria">§{calculadora.seccion}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-tinta group-hover:text-uabc-verde">
                    {calculadora.titulo}
                  </span>
                  <Icono nombre="flechaDerecha" className="h-4 w-4 shrink-0 text-tinta-secundaria transition-transform group-hover:translate-x-0.5 group-hover:text-uabc-verde" />
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
        <TarjetaHistorial entradas={historial} maximo={5} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Tarjeta etiqueta="Arquitectura" titulo="Estado del sistema" icono="procesador">
          <dl className="space-y-3.5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-tinta-secundaria">Motor matemático</dt>
              <dd className="text-right font-medium text-tinta">Local · TypeScript y math.js</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-tinta-secundaria">Base de datos</dt>
              <dd className="flex items-center gap-2 text-right font-medium text-tinta">
                <span
                  className={`h-2 w-2 rounded-full ${
                    firebaseConfigurado === null ? 'bg-borde' : firebaseConfigurado ? 'bg-estado-exito' : 'bg-uabc-dorado'
                  }`}
                />
                {firebaseConfigurado === null ? 'Verificando…' : firebaseConfigurado ? 'Firestore configurado' : 'Catálogo local'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-tinta-secundaria">Tablas críticas</dt>
              <dd className="text-right font-mono text-xs text-tinta">
                v{TABLAS_CRITICAS.metadatos.version} · {TABLAS_CRITICAS.metadatos.generado}
              </dd>
            </div>
          </dl>
        </Tarjeta>
        <section className="relative rounded-tarjeta border border-dashed border-uabc-dorado-hover bg-uabc-dorado-tenue px-6 py-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#9a6a0f] ring-1 ring-uabc-dorado/40">
              <Icono nombre="bandera" className="h-4 w-4" />
            </span>
            <div>
              <p className="etiqueta-seccion">Hoja de ruta</p>
              <h2 className="text-[15px] font-semibold text-uabc-verde-noche">Incorporaciones a definir con el profesor</h2>
            </div>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {HOJA_DE_RUTA.map((elemento) => (
              <li key={elemento.titulo} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-uabc-dorado-hover" />
                <span className="text-sm">
                  <span className="font-medium text-tinta">{elemento.titulo}.</span>{' '}
                  <span className="text-tinta-secundaria">{elemento.detalle}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

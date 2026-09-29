/**
 * Tarjeta derecha de la vista de calculadora: resultados estadísticos, métricas y gráficas.
 */
import { useMemo, useState } from 'react';
import { cx } from '../../utils/clases';
import { crearFormateador, formatearValorP, type Formateador } from '../../utils/formato';
import { Tarjeta } from '../Cards/Tarjeta';
import { Icono } from '../Iconos/Icono';
import { Formula } from './Formula';
import { GraficaBarras } from './GraficaBarras';
import { GraficaDispersion } from './GraficaDispersion';
import { GraficaDistribucion } from './GraficaDistribucion';
import { GraficaIntervalo } from './GraficaIntervalo';
import { TablaResultados } from './TablaResultados';
import { textoPrincipal } from './textoResultado';
import type { GraficaResultado, MetricaResultado, ResultadoCalculadora, ValorPrincipal } from './tipos';

const CLAVE_DECIMALES = 'estadistica-avanzada:decimales';
const OPCIONES_DECIMALES = [2, 4, 6];

function leerDecimales(): number {
  try {
    const valor = Number(localStorage.getItem(CLAVE_DECIMALES));
    return OPCIONES_DECIMALES.includes(valor) ? valor : 4;
  } catch {
    return 4;
  }
}

function guardarDecimales(valor: number): void {
  try {
    localStorage.setItem(CLAVE_DECIMALES, String(valor));
  } catch {
    // Preferencia no persistente si el almacenamiento no está disponible.
  }
}

function ValorPrincipalVista({ principal, f }: { principal: ValorPrincipal; f: Formateador }) {
  if (principal.tipo === 'numero' && principal.simbolo) {
    return (
      <>
        <Formula expresion={principal.simbolo} /> = {f(principal.valor)}
      </>
    );
  }
  return <>{textoPrincipal(principal, f)}</>;
}

/**
 * Completa la última fila de la rejilla de métricas (2 columnas en móvil, 3 en pantallas
 * medianas) para que no queden huecos con el color de fondo.
 */
function CeldasDeRelleno({ cantidad }: { cantidad: number }) {
  const faltantesMovil = (2 - (cantidad % 2)) % 2;
  const faltantesAmplio = (3 - (cantidad % 3)) % 3;
  const total = Math.max(faltantesMovil, faltantesAmplio);
  return (
    <>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={cx('bg-white', i < faltantesMovil ? 'block' : 'hidden', i < faltantesAmplio ? 'sm:block' : 'sm:hidden')}
        />
      ))}
    </>
  );
}

function valorMetrica(metrica: MetricaResultado, f: Formateador): string {
  if (typeof metrica.valor === 'string') return metrica.valor;
  return metrica.esValorP ? formatearValorP(metrica.valor) : f(metrica.valor);
}

function Grafica({ grafica }: { grafica: GraficaResultado }) {
  switch (grafica.tipo) {
    case 'intervalo':
      return <GraficaIntervalo {...grafica} />;
    case 'distribucion':
      return <GraficaDistribucion {...grafica} />;
    case 'dispersion':
      return <GraficaDispersion {...grafica} />;
    case 'barras':
      return <GraficaBarras {...grafica} />;
  }
}

const TITULOS_GRAFICA: Record<GraficaResultado['tipo'], string> = {
  intervalo: 'Intervalo sobre la recta numérica',
  distribucion: 'Distribución de referencia y región de rechazo',
  dispersion: 'Diagrama de dispersión',
  barras: 'Comparación gráfica',
};

function EstadoVacio({ formulas }: { formulas: string[] }) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-tarjeta border border-dashed border-borde bg-fondo/50 px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-uabc-verde shadow-tarjeta">
        <Icono nombre="curva" className="h-6 w-6" />
      </span>
      <p className="mt-4 font-display text-base font-semibold text-uabc-verde-noche">Sin resultados todavía</p>
      <p className="mt-1 max-w-sm text-sm text-tinta-secundaria">
        Capture los datos en la tarjeta de la izquierda y presione <span className="font-semibold">Calcular</span>, o cargue el
        ejemplo precargado.
      </p>
      {formulas.length > 0 && (
        <div className="mt-6 w-full max-w-md space-y-1.5 rounded-tarjeta bg-white px-4 py-3 text-left shadow-sm ring-1 ring-black/5">
          <p className="etiqueta-seccion">Fórmulas que se aplicarán</p>
          {formulas.map((formula) => (
            <Formula key={formula} expresion={formula} bloque className="text-[13px] text-uabc-verde" />
          ))}
        </div>
      )}
    </div>
  );
}

interface PanelResultadosProps {
  resultado: ResultadoCalculadora | null;
  error: string | null;
  desactualizado: boolean;
  formulas: string[];
}

export function PanelResultados({ resultado, error, desactualizado, formulas }: PanelResultadosProps) {
  const [decimales, setDecimales] = useState(leerDecimales);
  const f = useMemo(() => crearFormateador(decimales), [decimales]);

  const selectorDecimales = (
    <div className="flex items-center gap-1.5">
      <span className="hidden text-xs text-tinta-secundaria sm:inline">Decimales</span>
      <div className="flex rounded-lg bg-fondo p-0.5 ring-1 ring-inset ring-borde/60">
        {OPCIONES_DECIMALES.map((opcion) => (
          <button
            key={opcion}
            type="button"
            aria-pressed={decimales === opcion}
            onClick={() => {
              setDecimales(opcion);
              guardarDecimales(opcion);
            }}
            className={cx(
              'rounded-md px-2 py-0.5 font-mono text-xs transition-colors',
              decimales === opcion ? 'bg-white font-semibold text-uabc-verde shadow-sm' : 'text-tinta-secundaria hover:text-tinta',
            )}
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Tarjeta
      etiqueta="Resultados y métricas"
      titulo={resultado ? resultado.etiqueta : 'Salida del motor matemático'}
      icono="curva"
      acciones={selectorDecimales}
    >
      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-tarjeta border border-estado-error/30 bg-estado-error/[0.06] px-4 py-3.5">
          <Icono nombre="alerta" className="mt-0.5 h-5 w-5 shrink-0 text-estado-error" />
          <div>
            <p className="text-sm font-semibold text-estado-error">No fue posible completar el cálculo</p>
            <p className="mt-0.5 text-sm text-tinta">{error}</p>
          </div>
        </div>
      ) : !resultado ? (
        <EstadoVacio formulas={formulas} />
      ) : (
        <div className={cx('space-y-6 transition-opacity', desactualizado && 'opacity-60')}>
          {desactualizado && (
            <p className="flex items-center gap-2 rounded-lg bg-uabc-dorado-tenue px-3 py-2 text-xs font-medium text-[#7a5410]">
              <Icono nombre="info" className="h-4 w-4" />
              Los datos capturados cambiaron. Presione Calcular para actualizar los resultados.
            </p>
          )}

          <div className="relative overflow-hidden rounded-tarjeta bg-uabc-verde px-5 py-5 text-white sm:px-6">
            <div aria-hidden="true" className="papel-milimetrado-claro absolute inset-0" />
            <div aria-hidden="true" className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-uabc-dorado/30" />
            <div className="relative">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-etiqueta text-uabc-dorado">{resultado.etiqueta}</p>
              <p className="mt-2 break-words font-mono text-[1.65rem] font-semibold leading-tight tracking-tight cifra sm:text-[2rem]">
                <ValorPrincipalVista principal={resultado.principal} f={f} />
              </p>
              {resultado.secundario && (
                <p className="mt-2 text-sm text-uabc-verde-claro">
                  {resultado.secundario.etiqueta}:{' '}
                  <span className="font-mono font-medium text-white cifra">
                    {resultado.secundario.esValorP ? formatearValorP(resultado.secundario.valor) : f(resultado.secundario.valor)}
                  </span>
                </p>
              )}
            </div>
          </div>

          {(resultado.hipotesis || resultado.decision) && (
            <div className="grid gap-3 md:grid-cols-2">
              {resultado.hipotesis && (
                <div className="rounded-tarjeta border border-fondo px-4 py-3">
                  <p className="etiqueta-seccion">Hipótesis</p>
                  <p className="mt-1.5 text-sm">
                    <Formula expresion={`H_{0}: ${resultado.hipotesis.nula}`} className="text-tinta" />
                  </p>
                  <p className="mt-1 text-sm">
                    <Formula expresion={`H_{1}: ${resultado.hipotesis.alternativa}`} className="text-tinta" />
                  </p>
                </div>
              )}
              {resultado.decision && (
                <div
                  className={cx(
                    'flex items-start gap-3 rounded-tarjeta border px-4 py-3',
                    resultado.decision.rechazarH0 ? 'border-uabc-dorado bg-uabc-dorado-tenue' : 'border-uabc-verde/25 bg-uabc-verde-tenue',
                  )}
                >
                  <Icono
                    nombre={resultado.decision.rechazarH0 ? 'alerta' : 'check'}
                    className={cx('mt-0.5 h-5 w-5 shrink-0', resultado.decision.rechazarH0 ? 'text-[#9a6a0f]' : 'text-uabc-verde')}
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-uabc-verde-noche">
                      {resultado.decision.rechazarH0 ? (
                        <>
                          Se rechaza <Formula expresion="H_{0}" />
                        </>
                      ) : (
                        <>
                          No se rechaza <Formula expresion="H_{0}" />
                        </>
                      )}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-tinta-secundaria">{resultado.decision.texto(f)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {resultado.metricas.length > 0 && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-tarjeta border border-fondo bg-fondo sm:grid-cols-3">
              {resultado.metricas.map((metrica) => (
                <div key={`${metrica.etiqueta}-${metrica.simbolo ?? ''}`} className="bg-white px-4 py-3">
                  <dt className="flex items-baseline gap-1.5 text-xs text-tinta-secundaria">
                    {metrica.simbolo && <Formula expresion={metrica.simbolo} className="font-semibold text-uabc-verde" />}
                    <span className="truncate">{metrica.etiqueta}</span>
                  </dt>
                  <dd className="mt-1 break-words font-mono text-[17px] font-medium text-tinta cifra">{valorMetrica(metrica, f)}</dd>
                  {metrica.nota && <p className="mt-0.5 text-[11px] text-tinta-secundaria">{metrica.nota}</p>}
                </div>
              ))}
              <CeldasDeRelleno cantidad={resultado.metricas.length} />
            </dl>
          )}

          {resultado.graficas?.map((grafica, i) => (
            <section key={i} className="rounded-tarjeta border border-fondo px-4 pb-4 pt-3.5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-uabc-verde-noche">
                <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-uabc-dorado" />
                {grafica.tipo === 'dispersion' && grafica.titulo ? grafica.titulo : TITULOS_GRAFICA[grafica.tipo]}
              </h3>
              <Grafica grafica={grafica} />
            </section>
          ))}

          {resultado.tablas?.map((tabla) => <TablaResultados key={tabla.titulo} tabla={tabla} decimales={decimales} />)}

          {resultado.interpretacion && (
            <div className="flex gap-3 rounded-tarjeta bg-fondo/70 px-4 py-3.5">
              <Icono nombre="info" className="mt-0.5 h-5 w-5 shrink-0 text-uabc-verde" />
              <div>
                <p className="etiqueta-seccion">Interpretación</p>
                <p className="mt-1 text-sm leading-relaxed text-tinta">{resultado.interpretacion(f)}</p>
              </div>
            </div>
          )}

          {resultado.avisos && resultado.avisos.length > 0 && (
            <ul className="space-y-1.5">
              {resultado.avisos.map((aviso) => (
                <li key={aviso} className="flex items-start gap-2 text-xs text-[#7a5410]">
                  <Icono nombre="alerta" className="mt-px h-3.5 w-3.5 shrink-0" />
                  {aviso}
                </li>
              ))}
            </ul>
          )}

          {resultado.origenCriticos && (
            <p className="flex items-center gap-2 border-t border-fondo pt-4 text-xs text-tinta-secundaria">
              <Icono nombre={resultado.origenCriticos === 'tabla' ? 'tabla' : 'procesador'} className="h-4 w-4" />
              {resultado.origenCriticos === 'tabla'
                ? 'Valores críticos consultados en la tabla local tablasCriticas.json.'
                : 'Valores críticos calculados por el motor de distribuciones (combinación no tabulada).'}
            </p>
          )}
        </div>
      )}
    </Tarjeta>
  );
}

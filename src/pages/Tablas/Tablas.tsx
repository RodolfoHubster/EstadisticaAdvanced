/**
 * Tablas estadísticas de referencia generadas por el motor (tablasCriticas.json),
 * con consulta puntual de valores críticos.
 */
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tarjeta } from '../../components/Cards/Tarjeta';
import { CampoNumerico } from '../../components/Inputs/CampoNumerico';
import { CampoOpciones } from '../../components/Inputs/CampoOpciones';
import { EncabezadoPagina } from '../../components/Layout/EncabezadoPagina';
import { Formula } from '../../components/MathResults/Formula';
import { cx } from '../../utils/clases';
import {
  TABLAS_CRITICAS,
  valorCriticoChiCuadrada,
  valorCriticoF,
  valorCriticoT,
  valorCriticoTukey,
  valorCriticoZ,
  type GradosLibertad,
  type ValorCritico,
} from '../../utils/math/consultaTablas';

interface TablaVista {
  id: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  encabezadoFilas: string;
  columnas: string[];
  filas: { etiqueta: string; valores: number[] }[];
  decimales: number;
}

const etiquetaGl = (gl: GradosLibertad) => (gl === 'inf' ? '∞' : String(gl));
const { normal, tStudent, chiCuadrada, fisher, rangoEstudentizado } = TABLAS_CRITICAS;

const TABLAS: TablaVista[] = [
  {
    id: 'normal',
    etiqueta: 'Normal acumulada',
    titulo: 'Distribución normal estándar acumulada',
    descripcion: normal.acumulada.descripcion,
    encabezadoFilas: 'z',
    columnas: normal.acumulada.columnas.map((c) => c.toFixed(2)),
    filas: normal.acumulada.filas.map((f) => ({ etiqueta: f.z, valores: f.valores })),
    decimales: 4,
  },
  {
    id: 't',
    etiqueta: 't de Student',
    titulo: 'Valores críticos de la distribución t',
    descripcion: tStudent.descripcion,
    encabezadoFilas: 'ν \\ α',
    columnas: tStudent.alfas.map(String),
    filas: tStudent.filas.map((f) => ({ etiqueta: etiquetaGl(f.gl), valores: f.valores })),
    decimales: 4,
  },
  {
    id: 'chi2',
    etiqueta: 'Ji-cuadrada',
    titulo: 'Valores críticos de la distribución ji-cuadrada',
    descripcion: chiCuadrada.descripcion,
    encabezadoFilas: 'ν \\ α',
    columnas: chiCuadrada.alfas.map(String),
    filas: chiCuadrada.filas.map((f) => ({ etiqueta: etiquetaGl(f.gl), valores: f.valores })),
    decimales: 4,
  },
  ...fisher.map((tabla) => ({
    id: `f-${tabla.alfa}`,
    etiqueta: `F (α = ${tabla.alfa})`,
    titulo: `Valores críticos de la distribución F, α = ${tabla.alfa}`,
    descripcion: tabla.descripcion,
    encabezadoFilas: 'ν₂ \\ ν₁',
    columnas: tabla.gl1.map(String),
    filas: tabla.filas.map((f) => ({ etiqueta: etiquetaGl(f.gl2), valores: f.valores })),
    decimales: 2,
  })),
  ...rangoEstudentizado.map((tabla) => ({
    id: `q-${tabla.alfa}`,
    etiqueta: `Tukey (α = ${tabla.alfa})`,
    titulo: `Rango estudentizado q, α = ${tabla.alfa}`,
    descripcion: tabla.descripcion,
    encabezadoFilas: 'ν \\ k',
    columnas: tabla.k.map(String),
    filas: tabla.filas.map((f) => ({ etiqueta: etiquetaGl(f.gl), valores: f.valores })),
    decimales: 3,
  })),
];

function TablaInteractiva({ tabla }: { tabla: TablaVista }) {
  const [foco, setFoco] = useState<{ fila: number; columna: number } | null>(null);
  return (
    <div className="max-h-[68vh] overflow-auto rounded-tarjeta border border-fondo" onMouseLeave={() => setFoco(null)}>
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-20 border-b border-r border-fondo bg-uabc-verde px-3 py-2 text-left font-mono text-xs font-semibold text-white">
              {tabla.encabezadoFilas}
            </th>
            {tabla.columnas.map((columna, j) => (
              <th
                key={columna}
                className={cx(
                  'sticky top-0 z-10 border-b border-fondo px-3 py-2 text-right font-mono text-xs font-semibold transition-colors',
                  foco?.columna === j ? 'bg-uabc-dorado text-uabc-verde-noche' : 'bg-uabc-verde text-white',
                )}
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila, i) => (
            <tr key={fila.etiqueta}>
              <th
                scope="row"
                className={cx(
                  'sticky left-0 z-10 border-b border-r border-fondo px-3 py-1.5 text-left font-mono text-xs font-semibold transition-colors',
                  foco?.fila === i ? 'bg-uabc-dorado text-uabc-verde-noche' : 'bg-fondo text-tinta',
                )}
              >
                {fila.etiqueta}
              </th>
              {fila.valores.map((valor, j) => {
                const cruce = foco?.fila === i || foco?.columna === j;
                const exacto = foco?.fila === i && foco?.columna === j;
                return (
                  <td
                    key={j}
                    onMouseEnter={() => setFoco({ fila: i, columna: j })}
                    className={cx(
                      'border-b border-fondo px-3 py-1.5 text-right font-mono text-[13px] cifra transition-colors',
                      exacto ? 'bg-uabc-verde font-semibold text-white' : cruce ? 'bg-uabc-dorado-tenue text-tinta' : 'bg-white text-tinta',
                    )}
                  >
                    {valor.toFixed(tabla.decimales)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Distribucion = 'z' | 't' | 'chi2' | 'f' | 'q';

function ConsultaValorCritico() {
  const [distribucion, setDistribucion] = useState<Distribucion>('t');
  const [alfa, setAlfa] = useState('0.05');
  const [gl1, setGl1] = useState('10');
  const [gl2, setGl2] = useState('20');

  const consulta = useMemo((): { valor: ValorCritico; notacion: string } | { error: string } => {
    const a = Number(alfa);
    const v1 = Number(gl1);
    const v2 = Number(gl2);
    if (!(a > 0 && a < 1)) return { error: 'α debe estar entre 0 y 1.' };
    const glValido = (v: number) => Number.isFinite(v) && v > 0;
    try {
      switch (distribucion) {
        case 'z':
          return { valor: valorCriticoZ(a), notacion: `z_{${a}}` };
        case 't':
          if (!glValido(v1)) return { error: 'Capture grados de libertad positivos.' };
          return { valor: valorCriticoT(a, v1), notacion: `t_{${a}}(${v1})` };
        case 'chi2':
          if (!glValido(v1)) return { error: 'Capture grados de libertad positivos.' };
          return { valor: valorCriticoChiCuadrada(a, v1), notacion: `χ^{2}_{${a}}(${v1})` };
        case 'f':
          if (!glValido(v1) || !glValido(v2)) return { error: 'Capture ν₁ y ν₂ positivos.' };
          return { valor: valorCriticoF(a, v1, v2), notacion: `f_{${a}}(${v1}, ${v2})` };
        case 'q':
          if (!Number.isInteger(v1) || v1 < 2 || !glValido(v2)) return { error: 'k debe ser un entero ≥ 2 y ν positivo.' };
          return { valor: valorCriticoTukey(a, v1, v2), notacion: `q_{${a}}(${v1}, ${v2})` };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Parámetros no válidos.' };
    }
  }, [distribucion, alfa, gl1, gl2]);

  const etiquetaGl1 = distribucion === 'q' ? 'Número de medias' : distribucion === 'f' ? 'gl del numerador' : 'Grados de libertad';
  const simboloGl1 = distribucion === 'q' ? 'k' : distribucion === 'f' ? 'ν_{1}' : 'ν';

  return (
    <Tarjeta etiqueta="Consulta puntual" titulo="Valor crítico" icono="buscar">
      <div className="space-y-4">
        <CampoOpciones
          id="consulta-distribucion"
          etiqueta="Distribución"
          valor={distribucion}
          onCambio={(v) => setDistribucion(v as Distribucion)}
          opciones={[
            { valor: 'z', etiqueta: 'z' },
            { valor: 't', etiqueta: 't' },
            { valor: 'chi2', etiqueta: 'χ²' },
            { valor: 'f', etiqueta: 'F' },
            { valor: 'q', etiqueta: 'q' },
          ]}
        />
        <CampoNumerico id="consulta-alfa" etiqueta="Área a la derecha" simbolo="α" valor={alfa} onCambio={setAlfa} sugerencias={['0.05', '0.025', '0.01']} />
        {distribucion !== 'z' && (
          <div className="grid grid-cols-2 gap-3">
            <CampoNumerico id="consulta-gl1" etiqueta={etiquetaGl1} simbolo={simboloGl1} valor={gl1} onCambio={setGl1} />
            {(distribucion === 'f' || distribucion === 'q') && (
              <CampoNumerico
                id="consulta-gl2"
                etiqueta={distribucion === 'f' ? 'gl del denominador' : 'gl del error'}
                simbolo={distribucion === 'f' ? 'ν_{2}' : 'ν'}
                valor={gl2}
                onCambio={setGl2}
              />
            )}
          </div>
        )}
        <div className="rounded-tarjeta bg-uabc-verde px-4 py-3.5 text-white">
          {'error' in consulta ? (
            <p className="text-sm text-uabc-verde-claro">{consulta.error}</p>
          ) : (
            <>
              <p className="font-mono text-xs text-uabc-dorado">
                <Formula expresion={consulta.notacion} />
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold cifra">{consulta.valor.valor.toFixed(4)}</p>
              <p className="mt-1 text-xs text-uabc-verde-claro">
                {consulta.valor.origen === 'tabla' ? 'Valor tabulado en tablasCriticas.json' : 'Calculado por el motor (no tabulado)'}
              </p>
            </>
          )}
        </div>
      </div>
    </Tarjeta>
  );
}

export default function Tablas() {
  const [parametros, setParametros] = useSearchParams();
  const tabla = TABLAS.find((t) => t.id === parametros.get('tabla')) ?? TABLAS[1];

  return (
    <>
      <EncabezadoPagina
        etiqueta="Referencia numérica"
        titulo="Tablas estadísticas"
        descripcion={
          <p>
            Tablas generadas por el mismo motor de distribuciones que utilizan las calculadoras y verificadas contra los valores
            publicados. {TABLAS_CRITICAS.metadatos.convencion}
          </p>
        }
      />
      <div role="tablist" aria-label="Seleccionar tabla" className="mb-5 flex flex-wrap gap-1.5">
        {TABLAS.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            role="tab"
            aria-selected={opcion.id === tabla.id}
            onClick={() => setParametros({ tabla: opcion.id }, { replace: true })}
            className={cx(
              'rounded-lg px-3.5 py-2 text-sm transition-colors',
              opcion.id === tabla.id
                ? 'bg-uabc-dorado font-semibold text-uabc-verde-noche shadow-sm'
                : 'bg-white font-medium text-tinta-secundaria ring-1 ring-borde hover:text-uabc-verde hover:ring-uabc-verde',
            )}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8 xl:col-span-9">
          <Tarjeta etiqueta={`Tabla · versión ${TABLAS_CRITICAS.metadatos.version}`} titulo={tabla.titulo} icono="tabla">
            <p className="mb-4 text-sm text-tinta-secundaria">{tabla.descripcion}</p>
            <TablaInteractiva key={tabla.id} tabla={tabla} />
            <p className="mt-3 text-xs text-tinta-secundaria">
              Generado el {TABLAS_CRITICAS.metadatos.generado} por {TABLAS_CRITICAS.metadatos.generadoPor}.
            </p>
          </Tarjeta>
        </div>
        <div className="lg:sticky lg:top-[calc(var(--altura-nav)+1rem)] lg:col-span-4 xl:col-span-3">
          <ConsultaValorCritico />
        </div>
      </div>
    </>
  );
}

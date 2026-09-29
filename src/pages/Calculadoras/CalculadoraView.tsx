/**
 * Vista de calculadora con estructura dividida en tarjetas:
 * izquierda, captura de datos; derecha, resultados estadísticos y gráficas.
 */
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tarjeta } from '../../components/Cards/Tarjeta';
import { TarjetaHistorial } from '../../components/Cards/TarjetaHistorial';
import { Icono } from '../../components/Iconos/Icono';
import { CampoDatos } from '../../components/Inputs/CampoDatos';
import { CampoNumerico } from '../../components/Inputs/CampoNumerico';
import { CampoOpciones } from '../../components/Inputs/CampoOpciones';
import { EncabezadoPagina } from '../../components/Layout/EncabezadoPagina';
import { Formula } from '../../components/MathResults/Formula';
import { PanelResultados } from '../../components/MathResults/PanelResultados';
import { textoPrincipal } from '../../components/MathResults/textoResultado';
import type { ResultadoCalculadora } from '../../components/MathResults/tipos';
import { obtenerUnidad } from '../../data/temario';
import { agregarAlHistorial, obtenerIdSesion, useHistorialSesion } from '../../hooks/useHistorialSesion';
import { cx } from '../../utils/clases';
import { crearFormateador } from '../../utils/formato';
import { ErrorCalculo, ErrorPendiente } from '../../utils/math/tipos';
import NoEncontrado from '../NoEncontrado';
import { calculadorasDeUnidad, obtenerCalculadora, type DefinicionCalculadora } from './definiciones';
import { describirDatos, ErrorCampo } from './definiciones/lectura';
import type { Campo, ValoresFormulario } from './definiciones/tipos';

function mismosValores(a: ValoresFormulario, b: ValoresFormulario): boolean {
  const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...claves].every((clave) => (a[clave] ?? '') === (b[clave] ?? ''));
}

/** Registro remoto opcional; se carga bajo demanda para no demorar la vista. */
function registrarEnFirestore(definicion: DefinicionCalculadora, resumen: string): void {
  import('../../services/firestoreService')
    .then(({ registrarCalculo }) =>
      registrarCalculo({ sesion: obtenerIdSesion(), calculadora: definicion.id, unidad: definicion.unidad, resumen }),
    )
    .catch(() => undefined);
}

interface CampoFormularioProps {
  campo: Exclude<Campo, { tipo: 'separador' }>;
  valores: ValoresFormulario;
  error?: string;
  onCambio: (id: string, valor: string) => void;
}

function CampoFormulario({ campo, valores, error, onCambio }: CampoFormularioProps) {
  const valor = valores[campo.id] ?? '';
  const cambiar = (nuevo: string) => onCambio(campo.id, nuevo);
  switch (campo.tipo) {
    case 'numero':
      return (
        <CampoNumerico
          id={campo.id}
          etiqueta={campo.etiqueta}
          simbolo={campo.simbolo}
          valor={valor}
          onCambio={cambiar}
          ayuda={campo.ayuda}
          error={error}
          sufijo={campo.sufijo}
          placeholder={campo.placeholder}
          sugerencias={campo.sugerencias}
        />
      );
    case 'opciones':
      return (
        <CampoOpciones
          id={campo.id}
          etiqueta={campo.etiqueta}
          valor={valor}
          opciones={campo.opciones}
          onCambio={cambiar}
          ayuda={campo.ayuda}
          destacado={campo.destacado}
        />
      );
    case 'datos':
      return (
        <CampoDatos
          id={campo.id}
          etiqueta={campo.etiqueta}
          valor={valor}
          onCambio={cambiar}
          filas={campo.filas}
          placeholder={campo.placeholder}
          ayuda={campo.ayuda}
          error={error}
          resumen={describirDatos(campo.formato, valor)}
        />
      );
  }
}

function VistaCalculadora({ definicion }: { definicion: DefinicionCalculadora }) {
  const unidad = obtenerUnidad(definicion.unidad);
  const hermanas = calculadorasDeUnidad(definicion.unidad);
  const historial = useHistorialSesion();

  const [valores, setValores] = useState<ValoresFormulario>(definicion.valoresIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoCalculadora | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [valoresCalculados, setValoresCalculados] = useState<ValoresFormulario | null>(null);

  const desactualizado = resultado !== null && valoresCalculados !== null && !mismosValores(valores, valoresCalculados);
  const camposVisibles = definicion.campos.filter((campo) => !campo.visibleSi || campo.visibleSi(valores));

  const actualizar = (id: string, valor: string) => {
    setValores((previos) => ({ ...previos, [id]: valor }));
    setErrores((previos) => {
      if (!(id in previos)) return previos;
      const restantes = { ...previos };
      delete restantes[id];
      return restantes;
    });
  };

  const ejecutar = (entrada: ValoresFormulario) => {
    try {
      const salida = definicion.calcular(entrada);
      setResultado(salida);
      setErrores({});
      setErrorGeneral(null);
      setValoresCalculados(entrada);
      const resumen = textoPrincipal(salida.principal, crearFormateador(4));
      agregarAlHistorial({
        calculadora: definicion.id,
        titulo: definicion.titulo,
        seccion: definicion.seccion,
        unidad: definicion.unidad,
        resumen,
      });
      registrarEnFirestore(definicion, resumen);
    } catch (error) {
      if (error instanceof ErrorCampo) {
        setErrores({ [error.campo]: error.message });
        setErrorGeneral(null);
        document.getElementById(error.campo)?.focus();
      } else if (error instanceof ErrorCalculo || error instanceof ErrorPendiente || error instanceof RangeError) {
        setErrorGeneral(error.message);
        setResultado(null);
      } else {
        setErrorGeneral('Ocurrió un error inesperado durante el cálculo. Verifique los datos capturados.');
        setResultado(null);
        console.error(error);
      }
    }
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    ejecutar(valores);
  };

  const cargarEjemplo = () => {
    const ejemplo = { ...definicion.valoresIniciales, ...definicion.ejemplo.valores, ...(valores.modo ? { modo: valores.modo } : {}) };
    setValores(ejemplo);
    ejecutar(ejemplo);
  };

  const limpiar = () => {
    setValores({ ...definicion.valoresIniciales, ...(valores.modo ? { modo: valores.modo } : {}) });
    setErrores({});
    setErrorGeneral(null);
    setResultado(null);
    setValoresCalculados(null);
  };

  return (
    <>
      <EncabezadoPagina
        antes={
          <nav aria-label="Ruta de navegación" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-tinta-secundaria">
            <Link to="/calculadoras" className="hover:text-uabc-verde">
              Calculadoras
            </Link>
            <Icono nombre="chevronDerecha" className="h-3.5 w-3.5" />
            <Link to={`/calculadoras?unidad=${definicion.unidad}`} className="hover:text-uabc-verde">
              Unidad {unidad?.romano}
            </Link>
            <Icono nombre="chevronDerecha" className="h-3.5 w-3.5" />
            <span className="font-mono text-tinta">§{definicion.seccion}</span>
          </nav>
        }
        etiqueta={`Unidad ${unidad?.romano} · ${unidad?.tituloCorto}`}
        titulo={definicion.titulo}
        descripcion={<p>{definicion.resumen}</p>}
        acciones={definicion.modalidades.map((modalidad) => (
          <span key={modalidad} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-tinta-secundaria ring-1 ring-borde">
            {modalidad}
          </span>
        ))}
      />

      {hermanas.length > 1 && (
        <nav aria-label="Calculadoras de la unidad" className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {hermanas.map((hermana) => (
            <Link
              key={hermana.id}
              to={`/calculadoras/${hermana.id}`}
              aria-current={hermana.id === definicion.id ? 'page' : undefined}
              className={cx(
                'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] transition-colors',
                hermana.id === definicion.id
                  ? 'border-uabc-verde bg-uabc-verde text-white'
                  : 'border-borde bg-white text-tinta-secundaria hover:border-uabc-verde hover:text-uabc-verde',
              )}
            >
              <span className="font-mono text-[11px] opacity-80">§{hermana.seccion}</span>
              <span className="font-medium">{hermana.titulo}</span>
            </Link>
          ))}
        </nav>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <form
          onSubmit={enviar}
          noValidate
          className="lg:sticky lg:top-[calc(var(--altura-nav)+1rem)] lg:col-span-5 lg:-m-1.5 lg:max-h-[calc(100vh-var(--altura-nav)-2rem)] lg:overflow-y-auto lg:p-1.5 xl:col-span-4"
        >
          <Tarjeta
            etiqueta="Captura de datos"
            titulo="Parámetros de entrada"
            icono="matriz"
            acciones={
              <button type="button" onClick={cargarEjemplo} className="boton-texto text-[13px]" title={definicion.ejemplo.descripcion}>
                <Icono nombre="matraz" className="h-4 w-4" />
                Ejemplo
              </button>
            }
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              {camposVisibles.map((campo) =>
                campo.tipo === 'separador' ? (
                  <div key={campo.id} className="flex items-center gap-3 pt-1 sm:col-span-2">
                    <span className="etiqueta-seccion">{campo.etiqueta}</span>
                    <span className="h-px flex-1 bg-fondo" />
                  </div>
                ) : (
                  <div
                    key={campo.id}
                    className={campo.ancho === 'medio' ? 'flex flex-col justify-end sm:col-span-1' : 'sm:col-span-2'}
                  >
                    <CampoFormulario campo={campo} valores={valores} error={errores[campo.id]} onCambio={actualizar} />
                  </div>
                ),
              )}
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-fondo pt-5">
              <button type="submit" className="boton-primario flex-1">
                <Icono nombre="calculadora" className="h-4 w-4" />
                Calcular
              </button>
              <button type="button" onClick={limpiar} className="boton-secundario">
                <Icono nombre="reiniciar" className="h-4 w-4" />
                Limpiar
              </button>
            </div>
            <p className="mt-4 flex gap-2 text-xs leading-relaxed text-tinta-secundaria">
              <Icono nombre="matraz" className="mt-px h-3.5 w-3.5 shrink-0 text-uabc-verde" />
              <span>
                <span className="font-medium text-tinta">Ejemplo disponible.</span> {definicion.ejemplo.descripcion}
              </span>
            </p>
          </Tarjeta>
        </form>

        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <PanelResultados
            resultado={resultado}
            error={errorGeneral}
            desactualizado={desactualizado}
            formulas={definicion.formulas}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Tarjeta etiqueta="Fundamento" titulo="Fórmulas aplicadas" icono="formula" className="lg:col-span-7 xl:col-span-8">
          <ul className="space-y-2.5">
            {definicion.formulas.map((formula) => (
              <li key={formula} className="overflow-x-auto rounded-lg bg-fondo/70 px-3.5 py-2.5">
                <Formula expresion={formula} className="whitespace-nowrap text-[14px] font-medium text-uabc-verde" />
              </li>
            ))}
          </ul>
          <Link to={`/formulario?unidad=${definicion.unidad}`} className="boton-texto -ml-2 mt-3 text-[13px]">
            Consultar el formulario de la Unidad {unidad?.romano}
            <Icono nombre="flechaDerecha" className="h-3.5 w-3.5" />
          </Link>
        </Tarjeta>
        <TarjetaHistorial entradas={historial} maximo={5} className="lg:col-span-5 xl:col-span-4" />
      </div>
    </>
  );
}

export default function CalculadoraView() {
  const { calculadoraId } = useParams();
  const definicion = obtenerCalculadora(calculadoraId);
  if (!definicion) {
    return <NoEncontrado mensaje="La calculadora solicitada no existe. Consulte el catálogo para elegir una técnica del temario." />;
  }
  return <VistaCalculadora key={definicion.id} definicion={definicion} />;
}

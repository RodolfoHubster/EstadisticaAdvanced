/** Formulario de referencia por unidad y tema. */
import { Link } from 'react-router-dom';
import { SelectorUnidad } from '../../components/Inputs/SelectorUnidad';
import { Icono } from '../../components/Iconos/Icono';
import { EncabezadoPagina } from '../../components/Layout/EncabezadoPagina';
import { Formula } from '../../components/MathResults/Formula';
import { FORMULARIO, type EntradaFormulario } from '../../data/formulario';
import { UNIDADES, type NumeroUnidad } from '../../data/temario';
import { useFiltroUnidad } from '../../hooks/useFiltroUnidad';

function TarjetaFormula({ entrada }: { entrada: EntradaFormulario }) {
  return (
    <article className="flex min-w-0 flex-col rounded-tarjeta bg-white shadow-tarjeta ring-1 ring-black/[0.035]">
      <header className="border-b border-fondo px-5 pb-3 pt-4">
        <p className="font-mono text-[11px] text-tinta-secundaria">§{entrada.seccion}</p>
        <h3 className="mt-0.5 text-[15px] font-semibold text-uabc-verde-noche">{entrada.titulo}</h3>
      </header>
      <dl className="flex-1 space-y-3 px-5 py-4">
        {entrada.expresiones.map((expresion) => (
          <div key={expresion.expresion}>
            {expresion.etiqueta && <dt className="etiqueta-seccion mb-1">{expresion.etiqueta}</dt>}
            <dd className="overflow-x-auto rounded-lg bg-fondo/70 px-3 py-2.5">
              <Formula expresion={expresion.expresion} className="whitespace-nowrap text-[14px] font-medium text-uabc-verde" />
            </dd>
          </div>
        ))}
        {entrada.nota && <p className="text-xs leading-relaxed text-tinta-secundaria">{entrada.nota}</p>}
      </dl>
      {entrada.calculadora && (
        <footer className="border-t border-fondo px-5 py-2.5">
          <Link to={`/calculadoras/${entrada.calculadora}`} className="boton-texto -ml-2 text-[13px]">
            Abrir calculadora
            <Icono nombre="flechaDerecha" className="h-3.5 w-3.5" />
          </Link>
        </footer>
      )}
    </article>
  );
}

export default function Formulario() {
  const [unidad, setUnidad] = useFiltroUnidad();
  const unidades = UNIDADES.filter((u) => !unidad || u.numero === unidad);
  const conteos = Object.fromEntries(
    UNIDADES.map((u) => [u.numero, FORMULARIO.filter((f) => f.unidad === u.numero).length]),
  ) as Record<NumeroUnidad, number>;

  return (
    <>
      <EncabezadoPagina
        etiqueta="Referencia de fórmulas"
        titulo="Formulario"
        descripcion={<p>Expresiones de cada tema del programa en notación estándar, con acceso directo a la calculadora correspondiente.</p>}
      />
      <SelectorUnidad valor={unidad} onCambio={setUnidad} conteos={conteos} />
      <div className="mt-8 space-y-10">
        {unidades.map((u) => (
          <section key={u.numero} aria-labelledby={`formulario-unidad-${u.numero}`}>
            <div className="mb-4 flex items-baseline gap-3">
              <span className="font-mono text-sm font-semibold text-uabc-dorado-hover">Unidad {u.romano}</span>
              <h2 id={`formulario-unidad-${u.numero}`} className="text-lg font-semibold text-uabc-verde-noche">
                {u.titulo}
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {FORMULARIO.filter((f) => f.unidad === u.numero).map((entrada) => (
                <TarjetaFormula key={entrada.id} entrada={entrada} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

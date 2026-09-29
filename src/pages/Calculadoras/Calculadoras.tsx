/** Catálogo de calculadoras agrupadas por unidad. */
import { Link } from 'react-router-dom';
import { SelectorUnidad } from '../../components/Inputs/SelectorUnidad';
import { Icono } from '../../components/Iconos/Icono';
import { EncabezadoPagina } from '../../components/Layout/EncabezadoPagina';
import { UNIDADES, type NumeroUnidad } from '../../data/temario';
import { useFiltroUnidad } from '../../hooks/useFiltroUnidad';
import { calculadorasDeUnidad, type DefinicionCalculadora } from './definiciones';

function TarjetaCalculadora({ calculadora }: { calculadora: DefinicionCalculadora }) {
  return (
    <Link
      to={`/calculadoras/${calculadora.id}`}
      className="group relative flex flex-col rounded-tarjeta bg-white p-5 shadow-tarjeta ring-1 ring-black/[0.035] transition-all hover:-translate-y-0.5 hover:shadow-profunda hover:ring-uabc-verde/30"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md bg-uabc-verde-tenue px-2 py-0.5 font-mono text-[11px] font-semibold text-uabc-verde">
          §{calculadora.seccion}
        </span>
        <Icono
          nombre="flechaDerecha"
          className="h-4 w-4 text-tinta-secundaria transition-transform group-hover:translate-x-0.5 group-hover:text-uabc-verde"
        />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold leading-snug text-uabc-verde-noche group-hover:text-uabc-verde">
        {calculadora.titulo}
      </h3>
      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-tinta-secundaria">{calculadora.resumen}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {calculadora.modalidades.map((modalidad) => (
          <span key={modalidad} className="rounded-full bg-fondo px-2 py-0.5 text-[11px] font-medium text-tinta-secundaria">
            {modalidad}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function Calculadoras() {
  const [unidad, setUnidad] = useFiltroUnidad();
  const unidades = UNIDADES.filter((u) => !unidad || u.numero === unidad);
  const conteos = Object.fromEntries(UNIDADES.map((u) => [u.numero, calculadorasDeUnidad(u.numero).length])) as Record<
    NumeroUnidad,
    number
  >;

  return (
    <>
      <EncabezadoPagina
        etiqueta="Motor de inferencia"
        titulo="Calculadoras"
        descripcion={
          <p>
            Cada calculadora separa la captura de datos de los resultados, muestra las métricas intermedias y reporta el origen de
            los valores críticos. Todos los cálculos se ejecutan localmente en el navegador.
          </p>
        }
      />
      <SelectorUnidad valor={unidad} onCambio={setUnidad} conteos={conteos} />
      <div className="mt-8 space-y-10">
        {unidades.map((u) => (
          <section key={u.numero} aria-labelledby={`calculadoras-unidad-${u.numero}`}>
            <div className="mb-4 flex items-center gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-tarjeta bg-uabc-verde font-display text-sm font-semibold text-uabc-dorado">
                {u.romano}
              </span>
              <div>
                <h2 id={`calculadoras-unidad-${u.numero}`} className="text-lg font-semibold text-uabc-verde-noche">
                  {u.titulo}
                </h2>
                <p className="text-xs text-tinta-secundaria">
                  {calculadorasDeUnidad(u.numero).length} calculadoras · {u.horas} horas de contenido
                </p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {calculadorasDeUnidad(u.numero).map((calculadora) => (
                <TarjetaCalculadora key={calculadora.id} calculadora={calculadora} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

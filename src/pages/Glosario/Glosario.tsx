/**
 * Glosario con buscador y filtro por unidad. Los términos se obtienen de Firestore
 * y, en su ausencia, del catálogo local.
 */
import { useEffect, useMemo, useState } from 'react';
import { CampoBusqueda } from '../../components/Inputs/CampoBusqueda';
import { SelectorUnidad } from '../../components/Inputs/SelectorUnidad';
import { Icono } from '../../components/Iconos/Icono';
import { EncabezadoPagina } from '../../components/Layout/EncabezadoPagina';
import { Formula } from '../../components/MathResults/Formula';
import { GLOSARIO_LOCAL, type TerminoGlosario } from '../../data/glosario';
import { UNIDADES, type NumeroUnidad } from '../../data/temario';
import { useFiltroUnidad } from '../../hooks/useFiltroUnidad';
import { obtenerGlosario, type OrigenDatos } from '../../services/firestoreService';
import { cx } from '../../utils/clases';
import { normalizar } from '../../utils/texto';

function Resaltado({ texto, consulta }: { texto: string; consulta: string }) {
  if (!consulta) return <>{texto}</>;
  const inicio = normalizar(texto).indexOf(normalizar(consulta));
  if (inicio < 0) return <>{texto}</>;
  const fin = inicio + consulta.length;
  return (
    <>
      {texto.slice(0, inicio)}
      <mark className="rounded-sm bg-uabc-dorado/35 px-0.5 text-inherit">{texto.slice(inicio, fin)}</mark>
      {texto.slice(fin)}
    </>
  );
}

function TarjetaTermino({ termino, consulta }: { termino: TerminoGlosario; consulta: string }) {
  const unidad = UNIDADES.find((u) => u.numero === termino.unidad);
  return (
    <article className="relative overflow-hidden rounded-tarjeta bg-white py-4 pl-6 pr-5 shadow-tarjeta ring-1 ring-black/[0.035]">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-uabc-dorado" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[15px] font-semibold text-uabc-verde">
          <Resaltado texto={termino.termino} consulta={consulta} />
        </h3>
        {termino.simbolo && (
          <span className="shrink-0 rounded-md bg-fondo px-2 py-0.5 text-[13px] text-uabc-verde-noche">
            <Formula expresion={termino.simbolo} />
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-tinta">{termino.definicion}</p>
      <p className="mt-2.5 font-mono text-[11px] text-tinta-secundaria">
        §{termino.seccion} · Unidad {unidad?.romano}
      </p>
    </article>
  );
}

export default function Glosario() {
  const [unidad, setUnidad] = useFiltroUnidad();
  const [consulta, setConsulta] = useState('');
  const [terminos, setTerminos] = useState<TerminoGlosario[]>(GLOSARIO_LOCAL);
  const [origen, setOrigen] = useState<OrigenDatos>('local');
  const [aviso, setAviso] = useState<string | undefined>();

  useEffect(() => {
    let vigente = true;
    obtenerGlosario().then((respuesta) => {
      if (!vigente) return;
      setTerminos(respuesta.terminos);
      setOrigen(respuesta.origen);
      setAviso(respuesta.aviso);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const consultaNormalizada = normalizar(consulta.trim());

  const coincidentes = useMemo(
    () =>
      terminos.filter(
        (t) =>
          !consultaNormalizada ||
          normalizar(t.termino).includes(consultaNormalizada) ||
          normalizar(t.definicion).includes(consultaNormalizada),
      ),
    [terminos, consultaNormalizada],
  );

  const conteos = useMemo(() => {
    const resultado: Partial<Record<NumeroUnidad, number>> = {};
    for (const termino of coincidentes) resultado[termino.unidad] = (resultado[termino.unidad] ?? 0) + 1;
    return resultado;
  }, [coincidentes]);

  const grupos = useMemo(() => {
    const visibles = coincidentes
      .filter((t) => !unidad || t.unidad === unidad)
      .sort((a, b) => a.termino.localeCompare(b.termino, 'es'));
    const porLetra = new Map<string, TerminoGlosario[]>();
    for (const termino of visibles) {
      const letra = normalizar(termino.termino).charAt(0).toUpperCase();
      porLetra.set(letra, [...(porLetra.get(letra) ?? []), termino]);
    }
    return [...porLetra.entries()];
  }, [coincidentes, unidad]);

  const total = grupos.reduce((suma, [, lista]) => suma + lista.length, 0);

  const irALetra = (letra: string) => {
    document.getElementById(`letra-${letra}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <EncabezadoPagina
        etiqueta="Referencia conceptual"
        titulo="Glosario de términos"
        descripcion={<p>Definiciones de los conceptos del programa, organizadas por unidad y referidas a la sección del temario.</p>}
        acciones={
          <span
            className={cx(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1',
              origen === 'firestore' ? 'bg-uabc-verde-tenue text-uabc-verde ring-uabc-verde/20' : 'bg-white text-tinta-secundaria ring-borde',
            )}
            title={aviso}
          >
            <Icono nombre="baseDatos" className="h-3.5 w-3.5" />
            {origen === 'firestore' ? 'Fuente: Firestore' : 'Fuente: catálogo local'}
          </span>
        }
      />

      <div className="space-y-4">
        <CampoBusqueda valor={consulta} onCambio={setConsulta} etiqueta="Buscar en el glosario" placeholder="Buscar término o definición…" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SelectorUnidad valor={unidad} onCambio={setUnidad} conteos={conteos} />
          <p className="text-sm text-tinta-secundaria">
            <span className="font-mono font-semibold text-tinta">{total}</span> {total === 1 ? 'término' : 'términos'}
          </p>
        </div>
        {grupos.length > 1 && (
          <nav aria-label="Índice alfabético" className="flex flex-wrap gap-1">
            {grupos.map(([letra]) => (
              <button
                key={letra}
                type="button"
                onClick={() => irALetra(letra)}
                className="h-7 w-7 rounded-md font-mono text-xs font-semibold text-tinta-secundaria transition-colors hover:bg-uabc-verde hover:text-white"
              >
                {letra}
              </button>
            ))}
          </nav>
        )}
      </div>

      {grupos.length === 0 ? (
        <div className="mt-10 rounded-tarjeta border border-dashed border-borde bg-white/60 px-6 py-12 text-center">
          <p className="font-display text-base font-semibold text-uabc-verde-noche">Sin coincidencias</p>
          <p className="mt-1 text-sm text-tinta-secundaria">No hay términos que coincidan con «{consulta}» en la unidad seleccionada.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {grupos.map(([letra, lista]) => (
            <section key={letra} id={`letra-${letra}`} className="scroll-mt-24">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-uabc-verde font-display text-sm font-semibold text-white">
                  {letra}
                </span>
                <span className="h-px flex-1 bg-borde/60" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {lista.map((termino) => (
                  <TarjetaTermino key={termino.id} termino={termino} consulta={consulta.trim()} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {aviso && <p className="mt-8 text-xs text-tinta-secundaria">{aviso}</p>}
    </>
  );
}

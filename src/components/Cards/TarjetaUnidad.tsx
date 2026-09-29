/** Tarjeta de unidad del temario para el selector del panel principal. */
import { Link } from 'react-router-dom';
import type { Unidad } from '../../data/temario';
import { Icono, type NombreIcono } from '../Iconos/Icono';

interface TarjetaUnidadProps {
  unidad: Unidad;
  conteos: { glosario: number; formulas: number; calculadoras: number };
}

export function TarjetaUnidad({ unidad, conteos }: TarjetaUnidadProps) {
  const acento = unidad.numero % 2 === 1 ? 'bg-uabc-verde' : 'bg-uabc-dorado';
  const accesos: { ruta: string; etiqueta: string; conteo: number; icono: NombreIcono }[] = [
    { ruta: `/glosario?unidad=${unidad.numero}`, etiqueta: 'Glosario', conteo: conteos.glosario, icono: 'libro' },
    { ruta: `/formulario?unidad=${unidad.numero}`, etiqueta: 'Fórmulas', conteo: conteos.formulas, icono: 'formula' },
    { ruta: `/calculadoras?unidad=${unidad.numero}`, etiqueta: 'Calculadoras', conteo: conteos.calculadoras, icono: 'calculadora' },
  ];
  return (
    <article className="relative flex flex-col overflow-hidden rounded-tarjeta bg-white shadow-tarjeta ring-1 ring-black/[0.035]">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[5px] ${acento}`} />
      <div className="flex-1 px-6 pb-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="etiqueta-seccion">Unidad {unidad.romano}</p>
            <h3 className="mt-1 text-lg font-semibold leading-snug text-uabc-verde">{unidad.titulo}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-fondo px-2.5 py-1 font-mono text-xs font-medium text-tinta-secundaria">
            {unidad.horas} h
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-tinta-secundaria">{unidad.competencia}</p>
        <ul className="mt-4 grid gap-x-5 gap-y-1.5 text-[13px] sm:grid-cols-2">
          {unidad.temas.map((tema) => (
            <li key={tema.seccion} className="flex min-w-0 gap-2">
              <span className="w-7 shrink-0 font-mono text-[11px] leading-5 text-uabc-verde/70">{tema.seccion}</span>
              <span className="min-w-0 leading-5 text-tinta">{tema.titulo}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-3 divide-x divide-fondo border-t border-fondo bg-fondo/40">
        {accesos.map((acceso) => (
          <Link
            key={acceso.etiqueta}
            to={acceso.ruta}
            className="group flex items-center justify-center gap-2 px-2 py-3 text-[13px] font-medium text-tinta-secundaria transition-colors hover:bg-uabc-verde-tenue hover:text-uabc-verde"
          >
            <Icono nombre={acceso.icono} className="h-4 w-4" />
            <span className="hidden sm:inline">{acceso.etiqueta}</span>
            <span className="rounded-full bg-white px-1.5 font-mono text-[11px] text-tinta-secundaria ring-1 ring-black/5 group-hover:text-uabc-verde">
              {acceso.conteo}
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}

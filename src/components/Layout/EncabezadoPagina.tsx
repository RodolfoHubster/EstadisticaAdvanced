import type { ReactNode } from 'react';

interface EncabezadoPaginaProps {
  etiqueta: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  /** Contenido previo al título, por ejemplo una ruta de navegación. */
  antes?: ReactNode;
}

export function EncabezadoPagina({ etiqueta, titulo, descripcion, acciones, antes }: EncabezadoPaginaProps) {
  return (
    <header className="mb-8">
      {antes}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="etiqueta-seccion flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-7 bg-uabc-dorado" />
            {etiqueta}
          </p>
          <h1 className="mt-2.5 text-[1.9rem] font-semibold leading-tight tracking-tight text-uabc-verde sm:text-[2.15rem]">
            {titulo}
          </h1>
          {descripcion && <div className="mt-2.5 text-[15px] leading-relaxed text-tinta-secundaria">{descripcion}</div>}
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
      </div>
    </header>
  );
}

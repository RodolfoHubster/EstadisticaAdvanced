import { Icono } from '../Iconos/Icono';

interface CampoBusquedaProps {
  valor: string;
  onCambio: (valor: string) => void;
  placeholder?: string;
  etiqueta: string;
}

export function CampoBusqueda({ valor, onCambio, placeholder = 'Buscar término…', etiqueta }: CampoBusquedaProps) {
  return (
    <div className="relative">
      <Icono
        nombre="buscar"
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-tinta-secundaria"
      />
      <input
        type="search"
        value={valor}
        aria-label={etiqueta}
        placeholder={placeholder}
        onChange={(evento) => onCambio(evento.target.value)}
        className="w-full rounded-full border border-borde bg-white py-3 pl-11 pr-4 text-[15px] text-tinta shadow-sm transition-colors placeholder:text-tinta-secundaria/70 focus:border-uabc-verde focus:outline-none focus:ring-2 focus:ring-uabc-dorado/40"
      />
    </div>
  );
}

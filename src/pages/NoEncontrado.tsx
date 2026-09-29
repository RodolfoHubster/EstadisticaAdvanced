import { Link } from 'react-router-dom';
import { Icono } from '../components/Iconos/Icono';

interface NoEncontradoProps {
  mensaje?: string;
}

export default function NoEncontrado({ mensaje = 'La página solicitada no forma parte del sistema.' }: NoEncontradoProps) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="font-mono text-sm font-semibold text-uabc-dorado-hover">Error 404</p>
      <h1 className="mt-2 text-2xl font-semibold text-uabc-verde">Recurso no encontrado</h1>
      <p className="mt-2 text-sm text-tinta-secundaria">{mensaje}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="boton-primario">
          <Icono nombre="inicio" className="h-4 w-4" />
          Ir al inicio
        </Link>
        <Link to="/calculadoras" className="boton-secundario">
          Calculadoras
        </Link>
      </div>
    </div>
  );
}

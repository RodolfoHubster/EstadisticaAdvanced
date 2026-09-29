/** Área de captura para conjuntos de datos (vectores, matrices o grupos). */
import { cx } from '../../utils/clases';
import { MensajeCampo } from './MensajeCampo';

interface CampoDatosProps {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  filas?: number;
  placeholder?: string;
  ayuda?: string;
  error?: string;
  /** Descripción del contenido detectado, por ejemplo "n = 12". */
  resumen?: string;
}

export function CampoDatos({ id, etiqueta, valor, onCambio, filas = 4, placeholder, ayuda, error, resumen }: CampoDatosProps) {
  const idMensaje = `${id}-mensaje`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-tinta">
        {etiqueta}
      </label>
      <textarea
        id={id}
        rows={filas}
        value={valor}
        spellCheck={false}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(evento) => onCambio(evento.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={idMensaje}
        className={cx(
          'campo-base cifra resize-y text-[13.5px] leading-6',
          error && 'border-estado-error bg-white focus:border-estado-error focus:ring-estado-error/25',
        )}
      />
      <MensajeCampo id={idMensaje} error={error} ayuda={ayuda} complemento={resumen} />
    </div>
  );
}

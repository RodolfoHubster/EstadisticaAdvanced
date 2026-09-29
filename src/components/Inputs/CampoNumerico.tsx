import { cx } from '../../utils/clases';
import { Formula } from '../MathResults/Formula';
import { MensajeCampo } from './MensajeCampo';

interface CampoNumericoProps {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  simbolo?: string;
  ayuda?: string;
  error?: string;
  sufijo?: string;
  placeholder?: string;
  /** Valores de acceso rápido, por ejemplo niveles de confianza habituales. */
  sugerencias?: string[];
}

export function CampoNumerico({
  id,
  etiqueta,
  valor,
  onCambio,
  simbolo,
  ayuda,
  error,
  sufijo,
  placeholder,
  sugerencias,
}: CampoNumericoProps) {
  const idMensaje = `${id}-mensaje`;
  return (
    <div>
      <div className="mb-1.5 flex min-h-[22px] items-center justify-between gap-2">
        <label htmlFor={id} className="flex min-w-0 items-center gap-2 text-sm font-medium leading-tight text-tinta">
          {simbolo && (
            <span className="inline-flex min-w-[1.9rem] shrink-0 justify-center rounded-md bg-uabc-verde-tenue px-1.5 py-0.5 text-xs font-semibold text-uabc-verde">
              <Formula expresion={simbolo} />
            </span>
          )}
          <span>{etiqueta}</span>
        </label>
        {sugerencias && (
          <div className="flex shrink-0 gap-1">
            {sugerencias.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                onClick={() => onCambio(sugerencia)}
                className={cx(
                  'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium transition-colors',
                  valor === sugerencia
                    ? 'bg-uabc-verde text-white'
                    : 'bg-fondo text-tinta-secundaria hover:bg-uabc-verde-tenue hover:text-uabc-verde',
                )}
              >
                {sugerencia}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={valor}
          placeholder={placeholder}
          onChange={(evento) => onCambio(evento.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          className={cx(
            'campo-base cifra',
            sufijo && 'pr-12',
            error && 'border-estado-error bg-white focus:border-estado-error focus:ring-estado-error/25',
          )}
        />
        {sufijo && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-mono text-sm text-tinta-secundaria">
            {sufijo}
          </span>
        )}
      </div>
      <MensajeCampo id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  );
}

import type { ReactNode } from 'react';

interface MensajeCampoProps {
  id: string;
  error?: string;
  ayuda?: string;
  /** Información complementaria alineada a la derecha (por ejemplo, el tamaño de muestra detectado). */
  complemento?: ReactNode;
}

export function MensajeCampo({ id, error, ayuda, complemento }: MensajeCampoProps) {
  if (!error && !ayuda && !complemento) return null;
  return (
    <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
      <p id={id} className={error ? 'font-medium text-estado-error' : 'text-tinta-secundaria'}>
        {error ?? ayuda}
      </p>
      {complemento && <p className="shrink-0 font-mono text-tinta-secundaria">{complemento}</p>}
    </div>
  );
}

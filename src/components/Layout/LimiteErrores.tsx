/**
 * Límite de errores de renderizado: evita que una falla en una vista deje la
 * aplicación en blanco y ofrece al usuario una forma de recuperarse.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface LimiteErroresProps {
  children: ReactNode;
  /** Al cambiar este valor (por ejemplo, la ruta) se restablece el estado de error. */
  clave: string;
}

interface EstadoLimite {
  error: Error | null;
  clave: string;
}

export class LimiteErrores extends Component<LimiteErroresProps, EstadoLimite> {
  state: EstadoLimite = { error: null, clave: this.props.clave };

  static getDerivedStateFromError(error: Error): Partial<EstadoLimite> {
    return { error };
  }

  static getDerivedStateFromProps(props: LimiteErroresProps, estado: EstadoLimite): Partial<EstadoLimite> | null {
    return props.clave !== estado.clave ? { error: null, clave: props.clave } : null;
  }

  componentDidCatch(error: Error, informacion: ErrorInfo): void {
    console.error('Error de renderizado', error, informacion.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-xl rounded-tarjeta bg-white px-6 py-8 text-center shadow-tarjeta">
        <p className="font-mono text-sm font-semibold text-estado-error">Error en la vista</p>
        <h1 className="mt-2 text-xl font-semibold text-uabc-verde">No fue posible mostrar este módulo</h1>
        <p className="mt-2 text-sm text-tinta-secundaria">{this.state.error.message}</p>
        <button type="button" className="boton-primario mt-6" onClick={() => this.setState({ error: null })}>
          Reintentar
        </button>
      </div>
    );
  }
}

export function EstadoCarga({ mensaje = 'Cargando módulo…' }: { mensaje?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-16 text-sm text-tinta-secundaria">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-uabc-verde/20 border-t-uabc-verde" />
      {mensaje}
    </div>
  );
}

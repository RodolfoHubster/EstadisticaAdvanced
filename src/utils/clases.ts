/** Combina nombres de clase omitiendo los valores falsos. */
export function cx(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(' ');
}

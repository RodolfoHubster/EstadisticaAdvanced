/** Estado del filtro por unidad sincronizado con el parámetro ?unidad= de la URL. */
import { useSearchParams } from 'react-router-dom';
import { leerUnidadDeParametro, type NumeroUnidad } from '../data/temario';

export function useFiltroUnidad(): [NumeroUnidad | null, (unidad: NumeroUnidad | null) => void] {
  const [parametros, setParametros] = useSearchParams();
  const unidad = leerUnidadDeParametro(parametros.get('unidad'));
  const cambiar = (nueva: NumeroUnidad | null) => {
    const siguientes = new URLSearchParams(parametros);
    if (nueva) siguientes.set('unidad', String(nueva));
    else siguientes.delete('unidad');
    setParametros(siguientes, { replace: true });
  };
  return [unidad, cambiar];
}

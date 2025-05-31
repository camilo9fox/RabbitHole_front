import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Establecer el estado inicial
      setMatches(media.matches);
      
      // Definir callback para actualizar el estado
      const listener = () => setMatches(media.matches);
      
      // Añadir listener
      media.addEventListener('change', listener);
      
      // Cleanup
      return () => media.removeEventListener('change', listener);
    }
    
    return undefined;
  }, [query]);

  return matches;
}

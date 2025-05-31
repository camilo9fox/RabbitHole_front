'use client';

import { SearchBar } from '@/components/commons/molecules/SearchBar';

export const SearchSection = () => {
  const handleSearch = (query: string) => {
    console.log('Searching:', query);
    // Aquí puedes implementar la lógica real de búsqueda
  };

  return (
    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
      <SearchBar onSearch={handleSearch} />
    </div>
  );
};

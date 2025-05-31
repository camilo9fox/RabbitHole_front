'use client';

import { useForm } from 'react-hook-form';
import Input from '@/components/commons/atoms/Input';
import Button from '@/components/commons/atoms/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

interface SearchFormData {
  search: string;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { register, handleSubmit, control } = useForm<SearchFormData>();

  const handleSearch = handleSubmit((data) => {
    onSearch(data.search);
  });

  return (
    <div className="flex gap-2">
      <Input
        control={control}
        className="flex-1"
        {...register('search', { required: true })}
      />
      <Button
        variant="primary"
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  );
};

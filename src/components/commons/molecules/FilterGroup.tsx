import Button from '@/components/commons/atoms/Button';
import { useState } from 'react';

interface Filter {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterGroupProps {
  filters: Filter[];
  onFilterChange: (id: string, checked: boolean) => void;
}

export const FilterGroup = ({ filters, onFilterChange }: FilterGroupProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (id: string) => {
    const isChecked = !activeFilters.includes(id);
    setActiveFilters(isChecked ? [...activeFilters, id] : activeFilters.filter(f => f !== id));
    onFilterChange(id, isChecked);
  };

  return (
    <div className="space-y-4">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilters.includes(filter.id) ? 'primary' : 'outline'}
          onClick={() => handleFilterChange(filter.id)}
          className="w-full justify-start"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

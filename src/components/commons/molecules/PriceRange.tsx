'use client';

import { useForm} from 'react-hook-form';
import Input from '@/components/commons/atoms/Input';
import Text from '@/components/commons/atoms/Text';

interface PriceRangeProps {
  minPrice: number;
  maxPrice: number;
}

interface PriceRangeFormData {
  minPrice: number;
  maxPrice: number;
}

export const PriceRange = ({ minPrice, maxPrice }: PriceRangeProps) => {
  const { control, watch } = useForm<PriceRangeFormData>({
    defaultValues: { minPrice, maxPrice },
    mode: 'onChange'
  });

  const minPriceValue = watch('minPrice', minPrice);
  const maxPriceValue = watch('maxPrice', maxPrice);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Text variant="body" className="text-secondary">
          Rango de Precio
        </Text>
        <div className="flex gap-4">
          <Text variant="body" className="text-secondary">
            ${minPriceValue}
          </Text>
          <Text variant="body" className="text-secondary">
            ${maxPriceValue}
          </Text>
        </div>
      </div>
      <div className="flex gap-4">
        <Input
          name="minPrice"
          control={control}
          label="Precio Mínimo"
          rules={{
            required: 'El precio mínimo es requerido',
            min: { value: 0, message: 'El precio mínimo debe ser mayor o igual a $0' }
          }}
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
          type="number"
        />
        <Input
          name="maxPrice"
          control={control}
          label="Precio Máximo"
          rules={{
            required: 'El precio máximo es requerido',
            min: { value: minPriceValue, message: 'El precio máximo debe ser mayor o igual al precio mínimo' }
          }}
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
          type="number"
        />
      </div>
    </div>
  );
};

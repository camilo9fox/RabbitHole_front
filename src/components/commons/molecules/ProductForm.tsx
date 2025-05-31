'use client';import { useForm } from 'react-hook-form';
import Input from '@/components/commons/atoms/Input';
import Button from '@/components/commons/atoms/Button';
import Text from '@/components/commons/atoms/Text';

interface FormData {
  diseno: string;
  texto: string;
  color: string;
  talla: string;
}

interface ProductFormProps {
  onSubmit: (data: FormData) => void;
}

export const ProductForm = ({ onSubmit }: ProductFormProps) => {
  const { handleSubmit, control, formState: { errors } } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          name="diseno"
          control={control}
          label="Diseño"
          rules={{ required: 'El diseño es requerido' }}
          error={errors.diseno?.message}
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
        />
      </div>

      <div className="space-y-4">
        <Input
          name="texto"
          control={control}
          label="Texto"
          rules={{ required: 'El texto es requerido' }}
          error={errors.texto?.message}
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
        />
      </div>

      <div className="space-y-4">
        <Input
          name="color"
          control={control}
          label="Color"
          rules={{ required: 'El color es requerido' }}
          error={errors.color?.message}
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
        />
      </div>

      <div className="space-y-4">
        <Input
          name="talla"
          control={control}
          label="Talla"
          rules={{ required: 'La talla es requerida' }}
          error={errors.talla?.message}
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
        />
      </div>

      <Button type="submit" className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent/90 transition-colors">
        <Text variant="body" className="text-center">
          Personalizar
        </Text>
      </Button>

      <div>
        <Text variant="body" className="text-secondary mb-2">
          Color
        </Text>
        <Input
          name="color"
          control={control}
          as="select"
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
        >
          <option value="">Selecciona un color</option>
          <option value="white">Blanco</option>
          <option value="black">Negro</option>
          <option value="gray">Gris</option>
        </Input>
      </div>

      <div>
        <Text variant="body" className="text-secondary mb-2">
          Size
        </Text>
        <Input
          name="size"
          control={control}
          as="select"
          className="w-full p-2 border border-secondary rounded-lg bg-black text-white"
        >
          <option value="">Select size</option>
          <option value="s">Small</option>
          <option value="m">Medium</option>
          <option value="l">Large</option>
          <option value="xl">X-Large</option>
        </Input>
      </div>

      <Button type="submit" variant="primary" className="w-full">
        Customize
      </Button>
    </form>
  );
};

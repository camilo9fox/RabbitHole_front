import Card from '@/components/commons/atoms/Card';
import Image from '@/components/commons/atoms/Image';
import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';
import Link from '@/components/commons/atoms/Link';
import { useTheme } from 'next-themes';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  category: string;
}

export const ProductCard = ({
  id,
  image,
  title,
  price,
  category
}: ProductCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Usar el precio real del producto
  const priceInCLP = price;
  return (
    <Card className={`w-full max-w-lg ${!isDarkMode ? 'border border-gray-200 shadow-lg' : 'border border-gray-700'} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl`}>
      <Link href={`/product/${id}`} className="block overflow-hidden">
        <div className="relative overflow-hidden h-96 bg-gray-100 dark:bg-gray-800">
          <Image
            src={image}
            alt={title}
            width={1200}
            height={1200}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            unoptimized={true}
          />
        </div>
      </Link>
      <div className="p-6">
        <Link href={`/product/${id}`} className="block">
          <Text variant="h3" className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-xl font-bold mb-3 hover:text-accent transition-colors duration-200`}>
            {title}
          </Text>
        </Link>
        
        {/* Categoría del producto - Badge más grande y visible con texto negro */}
        <div className="absolute top-5 left-5 z-10">
          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-yellow-300 text-black shadow-lg border border-yellow-400">
            {category}
          </span>
        </div>
        
        {/* Precio con mejor diseño */}
        <div className="flex items-center justify-between mb-5">
          <Text variant="h4" className="text-2xl font-bold text-accent">
            ${priceInCLP.toLocaleString('es-CL')}
          </Text>
          <Text variant="small" className="text-xs text-gray-500 dark:text-gray-400">
            CLP
          </Text>
        </div>
        
        {/* Botón de ver más */}
        <Link href={`/product/${id}`} className="block w-full">
          <Button
            variant="primary"
            size="md"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            Ver más
          </Button>
        </Link>

      </div>
    </Card>
  );
};

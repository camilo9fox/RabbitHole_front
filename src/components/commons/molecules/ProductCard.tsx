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
  onAddToCart: () => void;
  width?: number;
  height?: number;
}

export const ProductCard = ({
  id,
  image,
  title,
  price,
  category,
  onAddToCart,
  width = 600,
  height = 800
}: ProductCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Usar el precio real del producto
  const priceInCLP = price;
  return (
    <Card className={`w-full max-w-sm ${!isDarkMode ? 'border border-gray-200 shadow-sm' : ''}`}>
      <Link href={`/product/${id}`} className="block">
        <Image
          src={image}
          alt={title}
          width={width}
          height={height}
          className="w-full h-64 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link href={`/product/${id}`} className="block">
          <Text variant="h3" className={`${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
            {title}
          </Text>
        </Link>
        
        {/* Categoría del producto */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
              {category}
            </span>
          </div>
        </div>
        
        {/* Precio */}
        <Text variant="h4" className="text-accent font-semibold mb-4">
          ${priceInCLP.toLocaleString('es-CL')} CLP
        </Text>
        
        {/* Botón de ver más */}
        <Button
          variant="primary"
          size="md"
          onClick={onAddToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          Ver más
        </Button>

      </div>
    </Card>
  );
};

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
  rating?: number;
  onAddToCart: () => void;
  width?: number;
  height?: number;
}

export const ProductCard = ({
  id,
  image,
  title,
  price,
  rating,
  onAddToCart,
  width = 600,
  height = 800
}: ProductCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Convertir precio a pesos chilenos (multiplicando por 850 como tasa de cambio aproximada)
  const priceInCLP = Math.round(price * 850);
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
        
        {/* Precio */}
        <Text variant="h4" className="text-accent font-semibold mb-3">
          ${priceInCLP.toLocaleString('es-CL')} CLP
        </Text>
        
        {/* Calificación con estrellas */}
        {rating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <Text variant="body" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ml-1`}>
                {rating}
              </Text>
            </div>
          </div>
        )}
        
        {/* Botón de agregar al carrito */}
        <Button
          variant="primary"
          size="md"
          onClick={onAddToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          Agregar al carrito
        </Button>

      </div>
    </Card>
  );
};

import Text from '@/components/commons/atoms/Text';
import Button from '@/components/commons/atoms/Button';

interface CartSummaryProps {
  items: number;
  subtotal: number;
  shipping: number;
  total: number;
  onCheckout: () => void;
}

export const CartSummary = ({
  items,
  subtotal,
  shipping,
  total,
  onCheckout
}: CartSummaryProps) => {
  return (
    <div className="p-6 bg-secondary/10 rounded-lg">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Text variant="body" className="text-secondary">
            Items ({items})
          </Text>
          <Text variant="body" className="text-white">
            ${subtotal.toFixed(2)}
          </Text>
        </div>
        <div className="flex justify-between">
          <Text variant="body" className="text-secondary">
            Shipping
          </Text>
          <Text variant="body" className="text-white">
            ${shipping.toFixed(2)}
          </Text>
        </div>
        <div className="pt-4 border-t border-secondary">
          <div className="flex justify-between">
            <Text variant="h4" className="text-white">
              Total
            </Text>
            <Text variant="h4" className="text-accent">
              ${total.toFixed(2)}
            </Text>
          </div>
        </div>
        <Button
          variant="primary"
          className="w-full mt-6"
          onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

import React from 'react';

interface PriceFormatterProps {
  amount: number;
  currency?: string;
  className?: string;
}

const PriceFormatter: React.FC<PriceFormatterProps> = ({
  amount,
  currency = 'CLP',
  className = ''
}) => {
  const formatPrice = () => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <span className={className}>
      {formatPrice()}
    </span>
  );
};

export default PriceFormatter;

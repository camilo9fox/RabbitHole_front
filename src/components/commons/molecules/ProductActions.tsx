import React from 'react';
import ActionButton from '@/components/commons/atoms/ActionButton';
import { AdminProduct } from '@/types/product';

interface ProductActionsProps {
  product: AdminProduct;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStore: (id: string) => void;
  isDeleting: boolean;
  onCancelDelete: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleStore,
  isDeleting,
  onCancelDelete
}) => {
  const storeButtonVariant = product.inStock ? 'warning' : 'success';
  const storeButtonText = product.inStock ? 'Quitar' : 'Publicar';
  const storeButtonTitle = product.inStock ? 'Quitar producto de la tienda' : 'Publicar producto en la tienda';
  
  return (
    <div className="flex flex-wrap gap-1 justify-center items-center">
      <ActionButton
        variant="primary"
        onClick={() => onEdit(product.id)}
        title="Editar producto"
        className="min-w-[70px]"
      >
        Editar
      </ActionButton>
      
      {isDeleting ? (
        <>
          <ActionButton
            variant="danger"
            onClick={() => onDelete(product.id)}
            title="Confirmar eliminación"
            className="min-w-[70px]"
          >
            Confirmar
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={onCancelDelete}
            title="Cancelar eliminación"
            className="min-w-[70px]"
          >
            Cancelar
          </ActionButton>
        </>
      ) : (
        <ActionButton
          variant="danger"
          onClick={() => onCancelDelete()}
          title="Eliminar producto"
          className="min-w-[70px]"
        >
          Eliminar
        </ActionButton>
      )}
      
      <ActionButton
        variant={storeButtonVariant}
        onClick={() => onToggleStore(product.id)}
        title={storeButtonTitle}
        className="min-w-[70px]"
      >
        {storeButtonText}
      </ActionButton>
    </div>
  );
};

export default ProductActions;

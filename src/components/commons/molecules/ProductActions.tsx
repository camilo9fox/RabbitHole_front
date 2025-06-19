import React from 'react';
import ActionButton from '@/components/commons/atoms/ActionButton';
import { ProductOnGetDTO } from '@/types/productData';

interface ProductActionsProps {
  product: ProductOnGetDTO;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStore: (id: number) => void;
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
  const storeButtonVariant = product.activo === 1 ? 'warning' : 'success';
  const storeButtonText = product.activo === 1 ? 'Quitar' : 'Publicar';
  const storeButtonTitle = product.activo === 1 ? 'Quitar producto de la tienda' : 'Publicar producto en la tienda';
  
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

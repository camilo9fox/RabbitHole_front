'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';
import { CartItemType } from '@/types/cart';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';

// Componentes de formulario
const Input = ({ label, type = 'text', ...props }: { label: string; type?: string; [key: string]: unknown }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  return (
  <div className="mb-4">
    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
    <input
      type={type}
      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 text-gray-900'}`}
      {...props}
    />
  </div>
  );
};

const CheckoutPage: React.FC = () => {
  const { cart, removeItem } = useCart();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const [step, setStep] = useState(1);
  
  // Estado para controlar qué vista se muestra para cada ítem personalizado
  const [activeViews, setActiveViews] = useState<Record<string, string>>({});
  
  // Log the current theme for debugging
  useEffect(() => {
    console.log('Current theme in CheckoutPage:', resolvedTheme);
  }, [resolvedTheme]);
  
  // Función auxiliar para obtener las clases del círculo de paso
  const getStepCircleClasses = (stepNumber: number): string => {
    if (step >= stepNumber) {
      return 'bg-blue-600 text-white';
    }
    
    if (isDarkMode) {
      return 'bg-gray-700 text-gray-400';
    }
    
    return 'bg-gray-200 text-gray-600';
  };
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvc: '',
  });

  // Formatear precio en CLP
  const formatPrice = (price: number) => {
    // Los precios ya están en pesos chilenos completos
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNextStep(e);
    } else {
      // Procesar el pago y finalizar la compra
      console.log('Procesando compra:', { cart, formData });
      // Aquí iría la lógica para procesar el pago y crear la orden
      alert('¡Compra realizada con éxito!');
    }
  };

  // Verificar si hay diseños personalizados pendientes de aprobación
  const hasPendingDesigns = cart.items.some(
    (item) => item.type === CartItemType.CUSTOM && 
    'design' in item && 
    item.design.status === 'pending'
  );

  // Renderizar los items del carrito
  const renderCartItems = () => {
    if (cart.items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">El carrito está vacío</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block">
            Continuar comprando
          </Link>
        </div>
      );
    }

    return (
      <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {cart.items.map((item, index) => {
          let image = '/assets/products/placeholder.png';
          let name = '';
          let price = 0;
          let details = '';
          
          if (item.type === CartItemType.STANDARD && 'product' in item) {
            image = item.product.images[0] ?? '/assets/products/placeholder.png';
            name = item.product.name;
            price = item.product.price;
            details = `${item.product.color} / Talla ${item.product.size.toUpperCase()}`;
          } else if (item.type === CartItemType.CUSTOM && 'design' in item) {
            // Obtener la vista activa o usar 'front' por defecto
            const itemKey = `custom-${item.design.id}`;
            const activeView = activeViews[itemKey] || 'front';
            
            // Obtener la imagen de la vista activa
            const viewData = item.design[activeView as 'front' | 'back' | 'left' | 'right'];
            image = viewData?.previewImage ?? viewData?.image ?? '/assets/products/placeholder.png';
            
            name = 'Polera Personalizada';
            // Usar el precio real del diseño personalizado
            price = item.price;
            details = `${item.design.color} / Talla ${item.design.size.toUpperCase()}`;
            
            if (item.design.status === 'pending') {
              details += ' / Pendiente de aprobación';
            } else if (item.design.status === 'approved') {
              details += ' / Aprobado';
            } else if (item.design.status === 'rejected') {
              details += ' / Rechazado';
            }
          }

          // Crear una clave única para cada item basada en su ID y tipo
          const itemKey = item.type === CartItemType.STANDARD 
            ? `standard-${item.product.id}` 
            : `custom-${item.design.id}`;
            
          return (
            <li key={itemKey} className="py-4 flex overflow-hidden cart-item-container w-full">
              <div className="flex">
                <div className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                  <Image
                    src={image}
                    alt={name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                
                {/* Botones de navegación entre vistas para diseños personalizados */}
                {item.type === CartItemType.CUSTOM && 'design' in item && (
                  <div className="ml-2 flex flex-col justify-center">
                    {Object.entries(item.design)
                      .filter(([key, view]) => 
                        ['front', 'back', 'left', 'right'].includes(key) && 
                        (view as { previewImage?: string })?.previewImage
                      )
                      .map(([viewKey]) => {
                        const isActive = activeViews[itemKey] === viewKey || (!activeViews[itemKey] && viewKey === 'front');
                        let label = '';
                        if (viewKey === 'front') label = 'F';
                        else if (viewKey === 'back') label = 'E';
                        else if (viewKey === 'left') label = 'I';
                        else if (viewKey === 'right') label = 'D';
                        
                        return (
                          <button
                            key={viewKey}
                            onClick={() => setActiveViews(prev => ({ ...prev, [itemKey]: viewKey }))}
                            className={`my-0.5 px-1.5 py-0.5 text-xs rounded-md ${isActive ? 'bg-blue-600 text-white font-bold' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                            title={viewKey.charAt(0).toUpperCase() + viewKey.slice(1)}
                          >
                            {label}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
              <div className="ml-4 flex flex-1 flex-col overflow-hidden">
                <div className={`flex justify-between text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} cart-item-title min-w-0`}>
                  <h3 className="truncate pr-2 max-w-[60%]">{name}</h3>
                  <p className="ml-2 flex-shrink-0 text-right">{formatPrice(price)}</p>
                </div>
                <p className={`mt-1 text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {details}
                </p>
                <div className="flex items-end justify-between text-sm w-full mt-1">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex-shrink-0`}>Cant. {item.quantity}</p>
                  <button
                    type="button"
                    className={`font-medium whitespace-nowrap flex-shrink-0 ml-2 px-2 py-0.5 rounded ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-500 hover:bg-red-50'}`}
                    onClick={() => removeItem(index)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  // Renderizar el resumen del carrito
  const renderCartSummary = () => (
    <div className={`rounded-lg p-4 shadow-md cart-summary-container ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
      <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen de la Orden</h2>
      <div className="flow-root max-h-[400px] overflow-y-auto w-full pr-1">
        {renderCartItems()}
      </div>
      <div className={`border-t pt-4 mt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex justify-between text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <p>Subtotal</p>
          <p>{formatPrice(cart.totalPrice)}</p>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Envío</p>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cart.totalPrice > 0 ? 'Calculado en el siguiente paso' : '$0'}</p>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Impuestos</p>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Incluidos</p>
        </div>
        <div className="flex justify-between py-2 text-base font-medium">
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</p>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(cart.totalPrice)}</p>
        </div>
      </div>
      
      {hasPendingDesigns && (
        <div className={`mt-4 p-3 border rounded-md ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-sm break-words ${isDarkMode ? 'text-yellow-100' : 'text-yellow-800'}`}>
            Tu pedido contiene diseños personalizados pendientes de aprobación. Estos serán revisados antes de procesar tu compra.
          </p>
        </div>
      )}
    </div>
  );

  // Renderizar el paso de información de envío
  const renderShippingInfo = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información de Envío</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Nombre" 
          name="firstName" 
          value={formData.firstName} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Apellido" 
          name="lastName" 
          value={formData.lastName} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <Input 
        label="Correo Electrónico" 
        type="email" 
        name="email" 
        value={formData.email} 
        onChange={handleChange} 
        required 
      />
      
      <Input 
        label="Dirección" 
        name="address" 
        value={formData.address} 
        onChange={handleChange} 
        required 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Ciudad" 
          name="city" 
          value={formData.city} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Código Postal" 
          name="postalCode" 
          value={formData.postalCode} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <Input 
        label="Teléfono" 
        type="tel" 
        name="phone" 
        value={formData.phone} 
        onChange={handleChange} 
        required 
      />
      
      <div className="flex justify-between pt-4">
        <Link 
          href="/cart" 
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${isDarkMode ? 'bg-blue-900 text-blue-100 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Carrito
        </Link>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continuar al Pago
        </button>
      </div>
    </form>
  );

  // Renderizar el paso de información de pago
  const renderPaymentInfo = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información de Pago</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            id="credit"
            name="paymentMethod"
            type="radio"
            value="credit"
            checked={formData.paymentMethod === 'credit'}
            onChange={handleChange}
            className={`h-4 w-4 focus:ring-2 ${isDarkMode ? 'text-blue-500 focus:ring-blue-400 border-gray-600' : 'text-blue-600 focus:ring-blue-500 border-gray-300'}`}
          />
          <label htmlFor="credit" className="flex items-center">
            <CreditCard className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
            <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tarjeta de Crédito/Débito</span>
          </label>
        </div>
      </div>
      
      {formData.paymentMethod === 'credit' && (
        <div className={`mt-4 p-4 border rounded-md ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
          <Input 
            label="Número de Tarjeta" 
            name="cardNumber" 
            value={formData.cardNumber} 
            onChange={handleChange} 
            placeholder="1234 5678 9012 3456" 
            required 
          />
          <Input 
            label="Nombre en la Tarjeta" 
            name="cardName" 
            value={formData.cardName} 
            onChange={handleChange} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Fecha de Expiración" 
              name="cardExpiry" 
              value={formData.cardExpiry} 
              onChange={handleChange} 
              placeholder="MM/AA" 
              required 
            />
            <Input 
              label="CVC" 
              name="cardCvc" 
              value={formData.cardCvc} 
              onChange={handleChange} 
              placeholder="123" 
              required 
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Envío
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Finalizar Compra
        </button>
      </div>
    </form>
  );

  // Renderizar el paso de confirmación
  const renderConfirmation = () => (
    <div className="space-y-6 text-center">
      <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
        <Check className={`h-8 w-8 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
      </div>
      
      <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¡Gracias por tu compra!</h2>
      
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Hemos recibido tu pedido y lo estamos procesando. Recibirás un correo electrónico con los detalles de tu compra.
      </p>
      
      {hasPendingDesigns && (
        <div className={`mt-4 p-4 border rounded-md text-left ${isDarkMode ? 'bg-yellow-900 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            Tu pedido contiene diseños personalizados que necesitan ser aprobados. Te notificaremos por correo electrónico cuando sean revisados.
          </p>
        </div>
      )}
      
      <div className="pt-6">
        <Link 
          href="/" 
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 focus:ring-blue-400' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          Volver a la Tienda
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Checkout</h1>
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center w-full">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStepCircleClasses(1)}`}>
                1
              </div>
              <div className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Envío</div>
            </div>
            <div className={`flex-1 mx-4 h-0.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStepCircleClasses(2)}`}>
                2
              </div>
              <div className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pago</div>
            </div>
            <div className={`flex-1 mx-4 h-0.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStepCircleClasses(3)}`}>
                3
              </div>
              <div className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Confirmación</div>
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="mt-12 mb-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 rounded-lg p-6 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {step === 1 && renderShippingInfo()}
              {step === 2 && renderPaymentInfo()}
              {step === 3 && renderConfirmation()}
            </div>
            
            <div className="lg:col-span-1 self-start sticky top-24 z-10">
              {renderCartSummary()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

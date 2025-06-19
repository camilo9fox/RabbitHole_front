"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { imgSrcToBase64 } from "@/services/adminProductService";
import ProductCanvas, {
  ProductCanvasRefHandle,
} from "@/components/commons/molecules/ProductCanvas";
import { AngleDesign } from "@/types/product";
import { StandardProduct } from "@/types/cart";
import Text from "@/components/commons/atoms/Text";
import Button from "@/components/commons/atoms/Button";
import { useTheme } from "next-themes";
import { useCart } from "@/context/CartContext";
import { ColorOption, ProductOnGetDTO, SizeOption } from "@/types/productData";
import { useProductData } from "@/context/ProductDataContext";
import { fetchProductById } from "@/services";

// Ángulos disponibles para la visualización del producto
const ANGLES = ["frente", "espalda", "izquierda", "derecha"];

export default function ProductDetail() {
  const { id } = useParams();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { addStandardItem } = useCart();

  // Estados
  const [product, setProduct] = useState<ProductOnGetDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAngle, setCurrentAngle] = useState<string>("frente");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { colors, sizes } = useProductData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [angleDesigns, setAngleDesigns] = useState<any[]>([]);

  // Contador para forzar la recreación del canvas cuando sea necesario
  const canvasKeyCounter = useRef<number>(0);

  // Referencias para los canvas de cada ángulo
  const canvasRefs = {
    frente: useRef<ProductCanvasRefHandle>(null),
    espalda: useRef<ProductCanvasRefHandle>(null),
    izquierda: useRef<ProductCanvasRefHandle>(null),
    derecha: useRef<ProductCanvasRefHandle>(null),
  };

  // Inicializar colores y tallas predeterminados cuando se carga el producto
  useEffect(() => {
    if (product) {
      // Inicializar color predeterminado si no está ya seleccionado
      if (selectedColor === null) {
        setSelectedColor(product.disenoPersonalizado.colorId);
      }

      // Inicializar talla predeterminada si no está ya seleccionada
      if (selectedSize === null) {
        const defaultSize = product.disenoPersonalizado.tallaId;
        setSelectedSize(defaultSize);
      }

      // Inicializar ángulo predeterminado si no está ya seleccionado
      if (currentAngle === "front") {
        setCurrentAngle("frente");
      }

      // Imprimir información del producto para depuración
      console.log("Producto cargado:", product);
    }
  }, [product, selectedColor, selectedSize, currentAngle, colors, sizes]);

  const loadProductData = async () => {
    if (id) {
      const productId = Array.isArray(id) ? id[0] : id;
      const fetchedProduct = await fetchProductById(Number(productId));

      if (fetchedProduct) {
        setProduct(fetchedProduct);
      }

      setLoading(false);
    }
  };

  // Cargar datos del producto
  useEffect(() => {
    loadProductData();
  }, [id]);

  useEffect(() => {
    if (product) {
      getAllAngleDesigns();
    }
  }, [product]);

  useEffect(() => {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log("Angle designs:", angleDesigns);
  }, [angleDesigns]);
  // Manejar cambio de ángulo
  const handleAngleChange = (angle: string) => {
    console.log(`Cambiando a ángulo: ${angle}`);
    // Incrementar el contador para forzar la recreación del canvas
    canvasKeyCounter.current += 1;
    setCurrentAngle(angle);
  };

  const getAllAngleDesigns = async () => {
    setAngleDesigns([
      { angle: "frente", design: await getDesignForAngle("frente") },
      { angle: "espalda", design: await getDesignForAngle("espalda") },
      { angle: "izquierda", design: await getDesignForAngle("izquierda") },
      { angle: "derecha", design: await getDesignForAngle("derecha") },
    ]);
  };

  // Obtener el diseño del producto para el ángulo actual
  const getDesignForAngle = async (
    angle: string
  ): Promise<AngleDesign | undefined> => {
    if (product?.disenoPersonalizado.angulos.length === 0) {
      console.log("No hay ángulos definidos en el producto");
      return undefined;
    }
    if (product) {
      const actualAngle = product.disenoPersonalizado.angulos.find(
        (a) => a?.nombreAngulo?.toLowerCase() === angle
      );

      let design: AngleDesign | undefined;
      if (actualAngle) {
        design = {
          thumbnail: actualAngle.thumbnailUrl,
          image:
            actualAngle.elemento.tipo === "IMAGEN"
              ? {
                  src: await imgSrcToBase64(
                    actualAngle.elemento.propiedadesElemento.urlImagen ?? ""
                  ),
                  position: {
                    x: actualAngle.elemento.propiedadesDiseno.posicionX ?? 0,
                    y: actualAngle.elemento.propiedadesDiseno.posicionY ?? 0,
                  },
                  size: {
                    width: actualAngle.elemento.propiedadesDiseno.anchura ?? 0,
                    height: actualAngle.elemento.propiedadesDiseno.altura ?? 0,
                  },
                }
              : undefined,
          text:
            actualAngle.elemento.tipo === "TEXTO"
              ? {
                  content:
                    actualAngle.elemento.propiedadesElemento.contenido ?? "",
                  font:
                    actualAngle.elemento.propiedadesElemento.fontFamily ?? "",
                  color: actualAngle.elemento.propiedadesElemento.color ?? "",
                  size: actualAngle.elemento.propiedadesElemento.fontSize ?? 0,
                  position: {
                    x: actualAngle.elemento.propiedadesDiseno.posicionX ?? 0,
                    y: actualAngle.elemento.propiedadesDiseno.posicionY ?? 0,
                  },
                }
              : undefined,
        };
      }
      return design;
    }
    return undefined;
  };

  // Estado para la notificación de éxito
  const [showNotification, setShowNotification] = useState(false);

  // Capturar imagen del canvas para un ángulo específico
  const captureCanvasImage = (angle: string): string => {
    try {
      // Acceder directamente al ref del ángulo específico
      const canvasRef = canvasRefs[angle as keyof typeof canvasRefs];

      // Usar encadenamiento opcional para acceso seguro
      const imageData = canvasRef.current?.captureCanvas();
      if (imageData) {
        console.log(`Imagen capturada para ángulo ${angle}`);
        return imageData;
      } else {
        console.warn(`No se pudo capturar imagen para el ángulo ${angle}`);
      }
    } catch (error) {
      console.error(
        `Error al capturar imagen del canvas para ángulo ${angle}:`,
        error
      );
    }
    return "";
  };

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!product || !selectedColor || !selectedSize) return;

    // Capturar imágenes del canvas para todos los ángulos
    const previewImages: Record<string, string> = {};
    const capturedImages: string[] = [];

    // Intentar capturar imágenes para todos los ángulos
    ANGLES.forEach((angle) => {
      const imageData = captureCanvasImage(angle);
      if (imageData) {
        previewImages[angle] = imageData;
        capturedImages.push(imageData);
      }
    });

    // Usar las imágenes capturadas, o el thumbnail predeterminado si no hay ninguna
    const productImages =
      capturedImages.length > 0
        ? capturedImages
        : [
            product.disenoPersonalizado.angulos.find(
              (angle) => angle.thumbnailUrl
            )?.thumbnailUrl ?? "",
          ];

    // Crear un objeto StandardProduct compatible con el contexto del carrito
    const standardProduct: StandardProduct = {
      id: product.id,
      name: product.nombre,
      description: product.descripcion ?? "",
      price: product.disenoPersonalizado.precio,
      images: productImages,
      color: selectedColor,
      size: selectedSize,
      category: product.categoriaNombre ?? "Poleras",
      inStock: true,
      previewImages: previewImages, // Guardar las imágenes de todos los ángulos
      previewImage: previewImages[currentAngle] || undefined, // Imagen del ángulo actual como principal
    };

    // Usar el contexto del carrito para agregar el producto
    addStandardItem(standardProduct, quantity);

    console.log(
      "Producto agregado al carrito con imágenes personalizadas:",
      standardProduct
    );

    // Mostrar notificación de éxito
    setShowNotification(true);

    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Renderizar selector de colores
  const renderColorSelector = () => {
    // Mostramos todos los colores disponibles en colorOptions
    console.log(
      "Renderizando selector de colores con todas las opciones disponibles"
    );

    return (
      <div className="mt-6">
        <Text variant="h5" className="mb-2 font-medium">
          Color
        </Text>
        <div className="flex flex-wrap gap-3">
          {colors.map((colorOption: ColorOption) => {
            const color = colorOption.value;
            const label = colorOption.label;
            const colorId = colorOption.id;

            // Determinar la clase de borde basada en la selección y el tema
            let borderClass = isDarkMode
              ? "border-gray-700"
              : "border-gray-300";
            let shadowClass = "";

            if (selectedColor === colorId) {
              borderClass = "border-blue-500";
              shadowClass = "shadow-md shadow-blue-500/30 scale-110";
            }

            // Determinar si el color es claro para agregar un borde de contraste
            const isLightColor =
              color === "#FFFFFF" || color === "#FFF" || color === "#FFFFFFFF";
            const contrastBorder = isLightColor
              ? "ring-1 ring-gray-300 dark:ring-gray-600"
              : "";

            return (
              <label
                key={colorId}
                className="relative cursor-pointer transition-all duration-200"
              >
                <input
                  type="radio"
                  name="color-selector"
                  value={colorId}
                  checked={selectedColor === colorId}
                  onChange={() => setSelectedColor(colorId)}
                  className="sr-only" // Ocultar visualmente pero mantener accesible
                />
                <span
                  className={`block w-10 h-10 rounded-full border-2 ${borderClass} ${shadowClass} ${contrastBorder} transition-all duration-200`}
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                  title={label}
                />
                <span className="sr-only">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar selector de tallas
  const renderSizeSelector = () => {
    // Mostramos todas las tallas disponibles en sizeOptions
    console.log(
      "Renderizando selector de tallas con todas las opciones disponibles"
    );

    return (
      <div className="mt-6">
        <Text variant="h5" className="mb-2 font-medium">
          Talla
        </Text>
        <div className="flex flex-wrap gap-3">
          {sizes.map((sizeOption: SizeOption) => {
            const sizeLabel = sizeOption.label;
            const sizeId = sizeOption.id;

            // Determinar las clases basadas en la selección y el tema
            let sizeClasses = "";
            let shadowClass = "";

            if (selectedSize === sizeId) {
              sizeClasses = isDarkMode
                ? "border-blue-500 bg-blue-900/40 text-blue-300 font-medium"
                : "border-blue-500 bg-blue-50 text-blue-700 font-medium";
              shadowClass = "shadow-md shadow-blue-500/30 scale-110";
            } else if (isDarkMode) {
              sizeClasses =
                "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500";
            } else {
              sizeClasses =
                "border-gray-300 bg-white text-gray-700 hover:border-gray-400";
            }

            return (
              <label
                key={sizeOption.id}
                className="relative cursor-pointer transition-all duration-200"
              >
                <input
                  type="radio"
                  name="size-selector"
                  value={sizeOption.id}
                  checked={selectedSize === sizeOption.id}
                  onChange={() => setSelectedSize(sizeOption.id)}
                  className="sr-only" // Ocultar visualmente pero mantener accesible
                />
                <span
                  className={`flex w-12 h-12 items-center justify-center rounded-md cursor-pointer border ${sizeClasses} ${shadowClass} transition-all duration-200`}
                  aria-hidden="true"
                >
                  <Text variant="body">{sizeLabel}</Text>
                </span>
                <span className="sr-only">Talla {sizeLabel}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar selector de ángulos
  const renderAngleSelector = () => {
    return (
      <div
        className="flex justify-center gap-2 mt-4"
        role="radiogroup"
        aria-label="Vistas del producto"
      >
        {ANGLES.map((angle) => {
          // Determinar las clases basadas en la selección y el tema
          let angleClasses = "";

          if (currentAngle === angle) {
            angleClasses = "border-blue-500 bg-blue-50 text-blue-700";
          } else if (isDarkMode) {
            angleClasses = "border-gray-700 bg-gray-800 text-gray-300";
          } else {
            angleClasses = "border-gray-200 bg-white text-gray-700";
          }

          return (
            <label key={angle} className="relative cursor-pointer">
              <input
                type="radio"
                name="angle-selector"
                value={angle}
                checked={currentAngle === angle}
                onChange={() => handleAngleChange(angle)}
                className="sr-only" // Ocultar visualmente pero mantener accesible
              />
              <span
                className={`flex min-w-[80px] h-12 items-center justify-center rounded-md cursor-pointer border px-3 ${angleClasses}`}
                aria-hidden="true"
              >
                <Text variant="body" className="capitalize text-sm">
                  {angle}
                </Text>
              </span>
              <span className="sr-only">Vista {angle}</span>
            </label>
          );
        })}
      </div>
    );
  };

  // Renderizar selector de cantidad
  const renderQuantitySelector = () => {
    // Determinar las clases para los botones basadas en el tema
    const buttonClasses = isDarkMode
      ? "bg-gray-800 text-white hover:bg-gray-700"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200";

    // Determinar las clases para el contador basadas en el tema
    const counterClasses = isDarkMode
      ? "bg-gray-900 text-white border-gray-700"
      : "bg-white text-gray-700 border-gray-200";

    return (
      <div className="mt-6">
        <Text variant="h5" className="mb-2 font-medium">
          Cantidad
        </Text>
        <div className="flex items-center">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className={`w-10 h-10 flex items-center justify-center rounded-l-md ${buttonClasses}`}
          >
            -
          </button>
          <div
            className={`w-12 h-10 flex items-center justify-center ${counterClasses} border-t border-b`}
          >
            {quantity}
          </div>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className={`w-10 h-10 flex items-center justify-center rounded-r-md ${buttonClasses}`}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Text variant="h2" className="text-3xl font-bold mb-4">
          Producto no encontrado
        </Text>
        <Text variant="body" className="text-muted mb-8">
          El producto que estás buscando no existe o ha sido eliminado.
        </Text>
        <Button
          variant="primary"
          onClick={() => window.history.back()}
          className="px-6 py-2"
        >
          Volver a la tienda
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-950" : "bg-gray-50"
      } pt-20 relative`}
    >
      {/* Notificación de éxito */}
      {showNotification && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-down">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <p className="font-medium">¡Producto agregado al carrito!</p>
            <p className="text-sm">
              {product?.nombre} -{" "}
              {selectedColor && selectedSize
                ? `${selectedColor}, Talla ${selectedSize}`
                : ""}
            </p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna izquierda: Imágenes del producto */}
          <div className="space-y-8">
            {/* Canvas del producto con colorización dinámica */}
            <div className="h-[650px] w-full flex items-center justify-center">
              {/* Canvas del ángulo actual */}
              {angleDesigns.length > 0 && (
                <>
                  <ProductCanvas
                    key={`canvas-${currentAngle}-${selectedColor}-${canvasKeyCounter.current}`}
                    angle={currentAngle}
                    color={colors.find((c) => c.id === selectedColor)!.value}
                    className="w-full h-full max-w-2xl mx-auto"
                    design={
                      angleDesigns.find((a) => a.angle === currentAngle)?.design
                    }
                    ref={canvasRefs[currentAngle as keyof typeof canvasRefs]}
                  />
                  {/* Canvases ocultos para otros ángulos (necesarios para capturar imágenes) */}
                  <div className="hidden">
                    {ANGLES.filter((angle) => angle !== currentAngle).map(
                      (angle) => (
                        <ProductCanvas
                          key={`hidden-canvas-${angle}-${selectedColor}`}
                          angle={angle}
                          color={selectedColor ?? "#FFFFFF"}
                          design={
                            angleDesigns.find((a) => a.angle === angle)?.design
                          }
                          className="w-0 h-0 overflow-hidden"
                          ref={canvasRefs[angle as keyof typeof canvasRefs]}
                        />
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Selector de ángulos */}
            {renderAngleSelector()}

            {/* No necesitamos miniaturas adicionales ya que usamos los ángulos */}
          </div>

          {/* Columna derecha: Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                {product.categoriaNombre}
              </span>
            </div>

            {/* Nombre del producto */}
            <Text variant="h1" className="text-3xl md:text-4xl font-bold">
              {product.nombre}
            </Text>

            {/* Precio */}
            <Text variant="h3" className="text-2xl font-semibold text-accent">
              ${product.disenoPersonalizado.precio.toLocaleString("es-CL")} CLP
            </Text>

            {/* Descripción */}
            <div className="py-4 border-t border-b border-gray-200 dark:border-gray-800">
              <Text variant="body" className="text-muted">
                {product.descripcion ||
                  "No hay descripción disponible para este producto."}
              </Text>
            </div>

            {/* Selector de color */}
            {renderColorSelector()}

            {/* Selector de talla */}
            {renderSizeSelector()}

            {/* Selector de cantidad */}
            {renderQuantitySelector()}

            {/* Botón de agregar al carrito */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize}
              className={`w-full py-3 mt-6 ${
                !selectedColor || !selectedSize
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {!selectedColor || !selectedSize
                ? "Selecciona color y talla"
                : "Agregar al carrito"}
            </button>

            {/* Información adicional */}
            <div
              className={`mt-8 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <div className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-accent mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <Text variant="body" className="font-medium">
                    Información de envío
                  </Text>
                  <Text variant="small" className="text-muted">
                    Entrega estimada: 3-5 días hábiles
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de productos relacionados (opcional) */}
        <div className="mt-20">
          <Text variant="h2" className="text-2xl font-bold mb-8">
            Productos relacionados
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Aquí irían los productos relacionados */}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HTMLCanvasV2 from "./HTMLCanvasV2";
import { DesignImage, DesignText } from "@/types/product";
import { imgSrcToBase64 } from "@/services/adminProductService";
import { fetchProductById } from "@/services";

interface ProductCardCanvasProps {
  id: string | number;
  title: string; // Nombre del producto
  price: number;
  image: string;
  category: string;
  color?: string;
  angle?: string;
}

const ProductCardCanvas: React.FC<ProductCardCanvasProps> = ({
  id,
  title,
  price,
  image,
  category,
  color = "#FFFFFF",
  angle = "frente",
}) => {
  // Estado para la ruta de la imagen base de la polera
  const [tshirtBasePath, setTshirtBasePath] = useState<string>(
    `/assets/products/${
      color === "#FFFFFF" ? "white" : color.replace("#", "")
    }-tshirt/${
      color === "#FFFFFF" ? "white" : color.replace("#", "")
    }-tshirt-${angle}.png`
  );
  const [designImage, setDesignImage] = useState<DesignImage | null>(null);
  const [imageError, setImageError] = useState(false);

  // Función para verificar si una imagen existe
  const checkImageExists = useCallback((src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Imagen cargada correctamente: ${src}`);
        resolve(true);
      };
      img.onerror = (error) => {
        console.error(`Error al cargar la imagen: ${src}`, error);
        resolve(false);
      };
      img.src = src;
    });
  }, []);

  // Función para obtener el nombre del color de la polera a partir del código hexadecimal
  const getTshirtHexColor = useCallback((colorId: string): string => {
    switch (colorId) {
      case "white":
        return "#FFFFFF";
      case "black":
        return "#1A1A1A";
      case "gray":
        return "#808080";
      case "blue":
        return "#0047AB";
      case "navy":
        return "#000080";
      case "lightblue":
        return "#ADD8E6";
      case "red":
        return "#FF0000";
      case "burgundy":
        return "#800020";
      case "pink":
        return "#FFC0CB";
      case "green":
        return "#008000";
      case "olive":
        return "#808000";
      case "mint":
        return "#98FF98";
      case "purple":
        return "#800080";
      case "yellow":
        return "#FFFF00";
      case "orange":
        return "#FFA500";
      default:
        return "#FFFFFF"; // Valor por defecto
    }
  }, []);
  // Efecto para cargar la imagen base de la polera
  useEffect(() => {
    const loadTshirtImage = async () => {
      try {
        // Obtener el nombre del color para la ruta de la imagen
        const colorName = "white";

        // Intentar cargar la imagen con el ángulo especificado
        const basePath = `/assets/products/${colorName}-tshirt/${colorName}-tshirt-${angle}.png`;
        console.log("Intentando cargar imagen de polera desde:", basePath);

        const mainImageExists = await checkImageExists(basePath);
        if (mainImageExists) {
          setTshirtBasePath(basePath);
          return;
        }

        // Si no se encuentra la imagen con el ángulo especificado, intentar con la vista frontal
        console.log("Imagen principal no encontrada, intentando alternativa");
        const frontPath = `/assets/products/${colorName}-tshirt/${colorName}-tshirt-frente.png`;
        const frontExists = await checkImageExists(frontPath);
        if (frontExists) {
          setTshirtBasePath(frontPath);
          return;
        }

        // Si aún no se encuentra, intentar con poleras de otros colores
        const fallbackPaths = [
          "/assets/products/white-tshirt/white-tshirt-frente.png",
          "/assets/products/black-tshirt/black-tshirt-frente.png",
        ];

        for (const path of fallbackPaths) {
          console.log(`Intentando ruta alternativa: ${path}`);
          const exists = await checkImageExists(path);
          if (exists) {
            setTshirtBasePath(path);
            return;
          }
        }

        // Si no se encuentra ninguna imagen, mostrar error
        setImageError(true);
        console.error("No se pudo cargar ninguna imagen de polera");
      } catch (error) {
        console.error("Error al cargar la imagen de la polera:", error);
        setImageError(true);
      }
    };

    loadTshirtImage();
  }, [color, angle, checkImageExists]);

  // Función para crear un objeto de imagen de diseño con tamaño y posición optimizados
  const createDesignObject = useCallback((src: string): DesignImage => {
    return {
      src,
      position: { x: 250, y: 250 }, // Centrado en el canvas
      size: { width: 200, height: 200 }, // Tamaño adecuado para el diseño
    };
  }, []);

  // Función para obtener el nombre del ángulo en español a partir del nombre en inglés
  const getSpanishAngleName = useCallback((englishAngle: string): string => {
    const reverseAngleMap: Record<string, string> = {
      front: "frente",
      back: "espalda",
      left: "izquierda",
      right: "derecha",
    };
    return reverseAngleMap[englishAngle] || "frente";
  }, []);

  // Efecto para cargar el diseño del producto
  // Estado para almacenar el texto del diseño
  const [designText, setDesignText] = useState<DesignText | null>(null);

  useEffect(() => {
    const loadProductDesign = async () => {
      try {
        console.log(
          `Cargando diseño para producto ID: ${id}, ángulo: ${angle}`
        );

        // Obtener el producto completo desde localStorage
        const product = await fetchProductById(Number(id));
        console.log("Producto obtenido:", product);

        if (!product) {
          console.log(`No se encontró el producto con ID: ${id}`);
          return;
        }

        // Orden de prioridad para los ángulos (inglés)
        const priorityAngles = ["Frente", "Espalda", "Izquierda", "Derecha"];

        for (const priorityAngle of priorityAngles) {
          // Primero verificamos si hay imagen
          const actualAngle = product.disenoPersonalizado.angulos.find(
            (a) => a.nombreAngulo === priorityAngle
          );
          if (actualAngle?.nombreAngulo) {
            const angleImgPath = `/assets/products/white-tshirt/white-tshirt-${actualAngle?.nombreAngulo?.toLowerCase()}.png`;
            const angleImgExists = await checkImageExists(angleImgPath);
            if (angleImgExists) {
              setTshirtBasePath(angleImgPath);
            }
          }
          if (actualAngle?.elemento?.propiedadesElemento?.urlImagen) {
            console.log(
              `Usando diseño de imagen del ángulo prioritario: ${priorityAngle}`
            );
            const designImg = {
              src: await imgSrcToBase64(
                actualAngle?.elemento?.propiedadesElemento?.urlImagen ?? ""
              ),
              position: {
                x: actualAngle?.elemento?.propiedadesDiseno?.posicionX ?? 0,
                y: actualAngle?.elemento?.propiedadesDiseno?.posicionY ?? 0,
              }, // Centrado en el canvas
              size: {
                width: actualAngle?.elemento?.propiedadesDiseno?.anchura ?? 0,
                height: actualAngle?.elemento?.propiedadesDiseno?.altura ?? 0,
              }, // Tamaño adecuado para el diseño
            };
            setDesignImage(designImg);
            setDesignText(null); // Limpiar texto si existe

            break;
          }
          // Luego verificamos si hay texto
          else if (actualAngle?.elemento?.propiedadesElemento?.contenido) {
            console.log(
              `Usando diseño de texto del ángulo prioritario: ${priorityAngle}`
            );
            const designText = {
              content:
                actualAngle?.elemento?.propiedadesElemento?.contenido ?? "",
              font:
                actualAngle?.elemento?.propiedadesElemento?.fontFamily ?? "",
              color: actualAngle?.elemento?.propiedadesElemento?.color ?? "",
              size: actualAngle?.elemento?.propiedadesElemento?.fontSize ?? 0,
              position: {
                x: actualAngle?.elemento?.propiedadesDiseno?.posicionX ?? 0,
                y: actualAngle?.elemento?.propiedadesDiseno?.posicionY ?? 0,
              },
            };
            setDesignText(designText);
            setDesignImage(null); // Limpiar imagen si existe

            break;
          }
        }
      } catch (error) {
        console.error("Error al cargar el diseño del producto:", error);
        setImageError(true);
      }
    };

    loadProductDesign();
  }, [
    id,
    angle,
    image,
    checkImageExists,
    createDesignObject,
    color,
    getSpanishAngleName,
  ]);

  return (
    <div className="max-w-lg bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/product/${id}`} className="block relative">
        <div className="relative h-96 overflow-hidden">
          {imageError ? (
            <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
              <div className="text-center p-4">
                <p className="mb-2">Error al cargar la imagen</p>
                <p className="text-xs text-gray-400">Ruta de imagen: {image}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Ruta de polera: {tshirtBasePath}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              {designImage && (
                <HTMLCanvasV2
                  tshirtImage={tshirtBasePath}
                  tshirtColor={getTshirtHexColor(color)}
                  useColorization={true}
                  designImage={designImage}
                />
              )}
              {designText && (
                <HTMLCanvasV2
                  tshirtImage={tshirtBasePath}
                  tshirtColor={getTshirtHexColor(color)}
                  useColorization={true}
                  designText={designText}
                />
              )}
            </div>
          )}
          <div className="absolute top-5 left-5">
            <span className="bg-yellow-300 text-black px-4 py-2 rounded-lg text-sm font-bold border border-yellow-400">
              {category}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
              minimumFractionDigits: 0,
            }).format(price)}
          </span>
          <Link
            href={`/product/${id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCardCanvas;

"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import HTMLCanvasV2 from "./HTMLCanvasV2";
import { DesignImage, DesignText } from "@/types/product";
import { Item } from "@/types/order";
import { useProductData } from "@/context/ProductDataContext";
import Loader from "../atoms/Loader";
import { imgSrcToBase64 } from "@/services/adminProductService";

interface CanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ANGLES = ["front", "back", "left", "right"] as const;
type Angle = (typeof ANGLES)[number];

// Función utilitaria para obtener el nombre de visualización del ángulo
const getAngleDisplayName = (angle: Angle): string => {
  switch (angle) {
    case "front":
      return "Frente";
    case "back":
      return "Espalda";
    case "left":
      return "Lado izquierdo";
    case "right":
      return "Lado derecho";
    default:
      return angle;
  }
};

const CanvasModal: React.FC<CanvasModalProps> = ({ isOpen, onClose, item }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { colors } = useProductData();
  const [currentAngle, setCurrentAngle] = useState<Angle>("front");
  const [availableAngles, setAvailableAngles] = useState<Angle[]>(["front"]);
  const [designImage, setDesignImage] = useState<DesignImage | undefined>(
    undefined
  );
  const [designText, setDesignText] = useState<DesignText | undefined>(
    undefined
  );
  const [loadingAngle, setLoadingAngle] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setAvailableAngles(["front", "back", "left", "right"]);

      // Siempre comenzamos con el frente
      setCurrentAngle("front");
    }
  }, [isOpen, item]);

  const handlePrevAngle = () => {
    setLoadingAngle(true);
    const currentIndex = availableAngles.indexOf(currentAngle);
    const prevIndex =
      (currentIndex - 1 + availableAngles.length) % availableAngles.length;
    setCurrentAngle(availableAngles[prevIndex]);
    setTimeout(() => {
      setLoadingAngle(false);
    }, 1000);
  };

  const handleNextAngle = () => {
    setLoadingAngle(true);
    const currentIndex = availableAngles.indexOf(currentAngle);
    const nextIndex = (currentIndex + 1) % availableAngles.length;
    setCurrentAngle(availableAngles[nextIndex]);
    setTimeout(() => {
      setLoadingAngle(false);
    }, 1000);
  };
  const angleMap: Record<Angle, string> = {
    front: "frente",
    back: "espalda",
    left: "izquierda",
    right: "derecha",
  };
  // Obtener la imagen de la polera base según el ángulo
  const getTshirtImage = (): string => {
    // Convertir ángulo en inglés al equivalente en español para las rutas de imágenes

    // Obtener el color para determinar qué carpeta usar
    const colorName = "white";

    // Construir la ruta correcta
    return `/assets/products/${colorName}-tshirt/${colorName}-tshirt-${angleMap[currentAngle]}.png`;
  };

  useEffect(() => {
    console.log({ colors });
  }, []);
  // Obtener el color de la polera
  const getTshirtColor = (): string => {
    return (
      colors.find((color) => color.label === item.colorNombre)?.value ??
      "#FFFFFF"
    );
  };

  // Obtener la imagen del diseño según el ángulo
  const getDesignImage = async (): Promise<DesignImage | undefined> => {
    setDesignImage(undefined);
    if (item?.productoId !== null) {
      const angleView = item.producto?.disenoPersonalizado?.angulos?.find(
        (angle) =>
          angle.nombreAngulo!.toLocaleLowerCase() === angleMap[currentAngle]
      );
      if (angleView?.elemento.tipo === "IMAGEN") {
        setDesignImage({
          src: await imgSrcToBase64(
            angleView.elemento.propiedadesElemento.urlImagen!
          ),
          position: {
            x: angleView.elemento.propiedadesDiseno.posicionX ?? 250,
            y: angleView.elemento.propiedadesDiseno.posicionY ?? 250,
          },
          size: {
            width: angleView.elemento.propiedadesDiseno.anchura ?? 200,
            height: angleView.elemento.propiedadesDiseno.altura ?? 200,
          },
        });
      }
    } else if (item?.disenoPersonalizadoId !== null) {
      // Para diseños personalizados usando acceso seguro
      const angleView = item.disenoPersonalizado?.angulos?.find(
        (angle) =>
          angle.nombreAngulo!.toLocaleLowerCase() === angleMap[currentAngle]
      );

      // Verificar que angleView existe y tiene una imagen
      if (angleView?.elemento.tipo === "IMAGEN") {
        setDesignImage({
          src: await imgSrcToBase64(
            angleView.elemento.propiedadesElemento.urlImagen!
          ),
          position: {
            x: angleView.elemento.propiedadesDiseno.posicionX ?? 250,
            y: angleView.elemento.propiedadesDiseno.posicionY ?? 250,
          },
          size: {
            width: angleView.elemento.propiedadesDiseno.anchura ?? 200,
            height: angleView.elemento.propiedadesDiseno.altura ?? 200,
          },
        });
      }
    }
    return undefined;
  };

  // Obtener el diseño de texto según el ángulo
  const getDesignText = (): DesignText | undefined => {
    setDesignText(undefined);
    if (item.productoId !== null) {
      const angleView = item.producto?.disenoPersonalizado?.angulos?.find(
        (angle) =>
          angle.nombreAngulo!.toLocaleLowerCase() === angleMap[currentAngle]
      );
      if (angleView?.elemento.tipo === "TEXTO") {
        setDesignText({
          content: angleView.elemento.propiedadesElemento.contenido!,
          position: {
            x: angleView.elemento.propiedadesDiseno.posicionX ?? 250,
            y: angleView.elemento.propiedadesDiseno.posicionY ?? 250,
          },
          size: angleView.elemento.propiedadesElemento.fontSize ?? 24,
          font: angleView.elemento.propiedadesElemento.fontFamily!,
          color: angleView.elemento.propiedadesElemento.color!,
        });
      }
    } else if (item.disenoPersonalizadoId !== null) {
      const angleView = item.disenoPersonalizado?.angulos?.find(
        (angle) =>
          angle.nombreAngulo!.toLocaleLowerCase() === angleMap[currentAngle]
      );

      // Verificar que angleView existe y tiene texto
      if (angleView?.elemento.tipo === "TEXTO") {
        setDesignText({
          content: angleView.elemento.propiedadesElemento.contenido!,
          position: {
            x: angleView.elemento.propiedadesDiseno.posicionX ?? 250,
            y: angleView.elemento.propiedadesDiseno.posicionY ?? 250,
          },
          size: angleView.elemento.propiedadesElemento.fontSize ?? 24,
          font: angleView.elemento.propiedadesElemento.fontFamily!,
          color: angleView.elemento.propiedadesElemento.color!,
        });
      }
    }
    return undefined;
  };

  useEffect(() => {
    getDesignImage();
    getDesignText();
  }, [currentAngle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div
        className={`relative max-w-2xl w-full rounded-lg shadow-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-4 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {item.productoId !== null
              ? item.producto?.nombre
              : "Diseño personalizado"}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-gray-500 hover:text-gray-700`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Canvas Container */}
        <div className="relative p-4">
          {/* Canvas */}
          <div className="flex justify-center">
            {loadingAngle ? (
              <Loader />
            ) : (
              <HTMLCanvasV2
                tshirtImage={getTshirtImage()}
                tshirtColor={getTshirtColor()}
                useColorization={true}
                designImage={designImage}
                designText={designText}
              />
            )}
          </div>

          {/* Ángulo actual */}
          <div className="mt-4 flex items-center justify-center">
            <span
              className={`text-base ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              } capitalize`}
            >
              {getAngleDisplayName(currentAngle)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        {availableAngles.length > 1 && (
          <div
            className={`flex justify-between p-4 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={handlePrevAngle}
              className={`flex items-center px-4 py-2 rounded-md ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Anterior
            </button>

            <button
              onClick={handleNextAngle}
              className={`flex items-center px-4 py-2 rounded-md ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              Siguiente
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasModal;

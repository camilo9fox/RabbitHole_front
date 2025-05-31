'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image, Text, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import useImage from 'use-image';

interface TShirtCanvasProps {
  tshirtImage: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  textFont?: string;
  textSize?: number;
  onUpdateTextPosition?: (x: number, y: number) => void;
  onUpdateImagePosition?: (x: number, y: number) => void;
  onUpdateTextSize?: (size: number) => void;
  onUpdateImageSize?: (width: number, height: number) => void;
}

// Tipo para identificar los elementos seleccionables
type ElementId = 'text' | 'image' | null;

interface Position {
  x: number;
  y: number;
}

const TShirtCanvas: React.FC<TShirtCanvasProps> = ({
  tshirtImage,
  customImage,
  customText = '',
  textColor = '#000000',
  textFont = 'Arial',
  textSize = 20,
  onUpdateTextPosition,
  onUpdateImagePosition,
  onUpdateTextSize,
  onUpdateImageSize
}) => {
  // Referencias para el canvas y los elementos
  const stageRef = useRef<Konva.Stage | null>(null);
  const textRef = useRef<Konva.Text | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  // Estados para las posiciones y selección
  const [selectedId, setSelectedId] = useState<ElementId>(null);
  const [tshirtImg] = useImage(tshirtImage);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 600 });
  const [textPosition, setTextPosition] = useState<Position>({ x: 250, y: 250 });
  const [imagePosition, setImagePosition] = useState<Position>({ x: 250, y: 250 });
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });

  // Cargar la imagen personalizada cuando cambie
  useEffect(() => {
    if (customImage) {
      const img = new window.Image();
      img.src = customImage;
      img.onload = () => {
        setUserImg(img);
        // Establecer un tamaño proporcional inicial
        const maxSize = 150;
        const ratio = img.width / img.height;
        let newWidth = maxSize;
        let newHeight = maxSize / ratio;
        
        if (newHeight > maxSize) {
          newHeight = maxSize;
          newWidth = maxSize * ratio;
        }
        
        setImageSize({ width: newWidth, height: newHeight });
      };
    } else {
      setUserImg(null);
    }
  }, [customImage]);

  // Ajustar el tamaño del canvas al tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        const width = Math.min(container.offsetWidth, 500);
        const height = width * 1.2; // Mantener proporción
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Actualizar el transformer cuando cambie la selección
  useEffect(() => {
    if (!transformerRef.current) return;

    if (selectedId === 'text' && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      const layer = transformerRef.current.getLayer();
      if (layer) layer.batchDraw();
    } else if (selectedId === 'image' && imageRef.current && userImg) {
      transformerRef.current.nodes([imageRef.current]);
      const layer = transformerRef.current.getLayer();
      if (layer) layer.batchDraw();
    } else {
      transformerRef.current.nodes([]);
      const layer = transformerRef.current.getLayer();
      if (layer) layer.batchDraw();
    }
  }, [selectedId, userImg]);

  // Manejar la selección de elementos
  const checkDeselect = (e: KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // Manejar el movimiento del texto
  const handleTextDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const newPos = { x: e.target.x(), y: e.target.y() };
    setTextPosition(newPos);
    if (onUpdateTextPosition) {
      onUpdateTextPosition(newPos.x, newPos.y);
    }
  };

  // Manejar el movimiento de la imagen
  const handleImageDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const newPos = { x: e.target.x(), y: e.target.y() };
    setImagePosition(newPos);
    if (onUpdateImagePosition) {
      onUpdateImagePosition(newPos.x, newPos.y);
    }
  };

  // Manejar la transformación del texto
  const handleTextTransform = () => {
    if (textRef.current) {
      const node = textRef.current;
      const newSize = node.fontSize();
      if (onUpdateTextSize) {
        onUpdateTextSize(newSize);
      }
    }
  };

  // Manejar la transformación de la imagen
  const handleImageTransform = () => {
    if (imageRef.current) {
      const node = imageRef.current;
      const newSize = {
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY()
      };
      setImageSize(newSize);
      
      // Resetear la escala después de aplicar el nuevo tamaño
      node.scaleX(1);
      node.scaleY(1);
      node.width(newSize.width);
      node.height(newSize.height);
      
      if (onUpdateImageSize) {
        onUpdateImageSize(newSize.width, newSize.height);
      }
    }
  };

  return (
    <div id="canvas-container" className="w-full">
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        ref={stageRef}
        onMouseDown={checkDeselect}
        onTouchStart={() => {
          // En dispositivos táctiles, deseleccionamos cualquier elemento seleccionado
          setSelectedId(null);
        }}
        className="border border-gray-300 rounded-lg mx-auto"
      >
        <Layer>
          {/* Imagen de la polera */}
          {tshirtImg && (
            <Image
              image={tshirtImg}
              width={canvasSize.width}
              height={canvasSize.height}
              x={0}
              y={0}
              alt="T-shirt background"
            />
          )}

          {/* Texto personalizado */}
          {customText && (
            <Text
              id="text"
              ref={textRef}
              text={customText}
              x={textPosition.x}
              y={textPosition.y}
              fontSize={textSize}
              fontFamily={textFont}
              fill={textColor}
              draggable
              onDragEnd={handleTextDragEnd}
              onClick={() => setSelectedId('text')}
              onTap={() => setSelectedId('text')}
              onTransformEnd={handleTextTransform}
            />
          )}

          {/* Imagen personalizada */}
          {userImg && (
            <Image
              id="image"
              ref={imageRef}
              image={userImg}
              x={imagePosition.x}
              y={imagePosition.y}
              width={imageSize.width}
              height={imageSize.height}
              offsetX={imageSize.width / 2}
              offsetY={imageSize.height / 2}
              draggable
              onDragEnd={handleImageDragEnd}
              onClick={() => setSelectedId('image')}
              onTap={() => setSelectedId('image')}
              onTransformEnd={handleImageTransform}
              alt="Custom user image"
            />
          )}

          {/* Transformer para redimensionar elementos */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limitar el tamaño mínimo
              if (newBox.width < 20 || newBox.height < 20) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default TShirtCanvas;

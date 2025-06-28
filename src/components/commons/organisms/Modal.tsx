"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { useTheme } from "next-themes";
import Text from "../atoms/Text";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  footer?: ReactNode;
  className?: string;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  footer,
  className,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Estado para controlar si estamos en el cliente
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define el tamaño del modal basado en la prop size
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  // Controla la apertura y cierre del modal
  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    if (isOpen) {
      // Usar showModal en lugar de show para el backdrop
      dialogElement.showModal();
      document.body.style.overflow = "hidden"; // Prevenir scroll
    } else {
      dialogElement.close();
      document.body.style.overflow = "visible"; // Restaurar scroll
    }

    return () => {
      if (dialogElement.open) {
        dialogElement.close();
      }
      document.body.style.overflow = "visible";
    };
  }, [isOpen]);

  // Gestionar eventos nativos del dialog
  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    // Gestionar el cierre con ESC (se puede deshabilitar)
    const handleEscKey = (event: Event) => {
      if (
        !closeOnEsc &&
        event instanceof KeyboardEvent &&
        event.key === "Escape"
      ) {
        event.preventDefault(); // Prevenir cierre nativo si closeOnEsc=false
      }
    };

    // Gestionar clic fuera del modal
    const handleClick = (event: MouseEvent) => {
      if (!closeOnClickOutside) {
        // Prevenir cierre al hacer clic fuera si closeOnClickOutside=false
        const rect = dialogElement.getBoundingClientRect();
        const isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (!isInDialog) {
          event.preventDefault();
        }
      }
    };

    // Gestionar cierre nativo del dialog
    const handleClose = () => {
      onClose();
    };

    dialogElement.addEventListener("cancel", handleEscKey);
    dialogElement.addEventListener("click", handleClick as EventListener);
    dialogElement.addEventListener("close", handleClose);

    return () => {
      dialogElement.removeEventListener("cancel", handleEscKey);
      dialogElement.removeEventListener("click", handleClick as EventListener);
      dialogElement.removeEventListener("close", handleClose);
    };
  }, [closeOnClickOutside, closeOnEsc, onClose]);

  // No renderizamos nada si no hay portal disponible (SSR) o no estamos montados
  if (typeof document === "undefined" || !mounted) return null;
  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={`p-0 m-auto rounded-lg shadow-xl ${
        isDarkMode
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100"
      } w-full ${sizeClasses[size]} ${className ?? ""}`}
    >
      {/* Cabecera del modal */}
      {(title || showCloseButton) && (
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {title && (
            <Text
              variant="h3"
              className={`${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </Text>
          )}
          {showCloseButton && (
            <button
              type="button"
              className={`rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => onClose()}
              aria-label="Cerrar"
            >
              <IoClose className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* Contenido del modal */}
      <div
        className={`p-6 overflow-y-auto ${
          isDarkMode ? "text-gray-200" : "text-gray-700"
        }`}
        style={{ maxHeight: "calc(90vh - 150px)" }}
      >
        {children}
      </div>

      {/* Pie del modal (opcional) */}
      {footer && (
        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {footer}
        </div>
      )}
    </dialog>,
    document.body
  );
};

export default Modal;

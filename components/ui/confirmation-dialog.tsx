'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Info, AlertCircle } from "lucide-react";
import { ReactNode } from "react";

export type ConfirmationDialogType = 'danger' | 'warning' | 'info' | 'default';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  type?: ConfirmationDialogType;
  showIcon?: boolean;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = 'default',
  showIcon = true,
  isLoading = false
}: ConfirmationDialogProps) {
  
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (type) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return "bg-red-600 hover:bg-red-700 focus:ring-red-600";
      case 'warning':
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600";
      case 'info':
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600";
      default:
        return "";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {getIcon()}
            <div className="flex-1">
              <AlertDialogTitle className="text-lg">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={getConfirmButtonClass()}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Convenience hooks for common confirmation types
import { useState } from 'react';

export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteCallback, setDeleteCallback] = useState<(() => void | Promise<void>) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirmDelete = (
    item: any,
    callback: () => void | Promise<void>,
    options?: {
      title?: string;
      description?: string;
    }
  ) => {
    setItemToDelete(item);
    setDeleteCallback(() => callback);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (deleteCallback) {
      setIsLoading(true);
      try {
        await deleteCallback();
      } finally {
        setIsLoading(false);
        setIsOpen(false);
        setItemToDelete(null);
        setDeleteCallback(null);
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setItemToDelete(null);
    setDeleteCallback(null);
  };

  return {
    isOpen,
    itemToDelete,
    confirmDelete,
    handleConfirm,
    handleCancel,
    isLoading,
    setIsOpen
  };
}
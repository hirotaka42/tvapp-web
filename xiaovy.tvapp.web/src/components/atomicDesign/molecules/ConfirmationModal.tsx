'use client'

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/atomicDesign/atoms/Button'

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline';
  hideButtons?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'はい',
  cancelText,
  confirmVariant = 'primary',
  hideButtons = false
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-4 flex-1">
              <DialogTitle
                as="h3"
                className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
              >
                {title}
              </DialogTitle>
              {message && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!hideButtons && (
            <div className={`mt-6 ${cancelText ? 'grid grid-cols-2 gap-3' : 'flex justify-center'}`}>
              {cancelText && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleClose}
                  fullWidth
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant={confirmVariant}
                size="md"
                onClick={handleConfirm}
                fullWidth={!!cancelText}
              >
                {confirmText}
              </Button>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

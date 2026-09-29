import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { H2, Body } from './Typography';

export const Dialog = ({ isOpen, onClose, title, description, children, footer, className = '' }: any) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  const handleKeyDown = (e: any) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      className={`bg-surface border border-border rounded-sm text-text-primary p-0 backdrop:bg-black/80 shadow-none m-auto max-w-lg w-full ${className}`}
    >
      <div className="flex flex-col w-full h-full">
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <H2 className="text-xl">{title}</H2>
            {description && <Body>{description}</Body>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="px-2 ml-4">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-border bg-surface-elevated flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
};

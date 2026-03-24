import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Unified sheet/modal:
 * - Mobile: slides up from bottom, rounded-t-3xl, drag handle
 * - Desktop (lg+): centered dialog, rounded-2xl, max-w-md
 */
const BottomSheet = ({ isOpen, onClose, title, children, footer, fullScreenMobile = false }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={[
          'fixed z-50 bg-white flex flex-col',
          // Mobile
          fullScreenMobile
            ? 'inset-0 lg:inset-auto'
            : 'bottom-0 left-0 right-0 rounded-t-3xl max-h-[92vh]',
          // Desktop override
          'lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2',
          'lg:rounded-2xl lg:w-full lg:max-w-md lg:max-h-[85vh]',
        ].join(' ')}
        style={{ paddingBottom: fullScreenMobile ? 'env(safe-area-inset-bottom, 0px)' : 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
      >
        {/* Drag handle — mobile only, not full-screen */}
        {!fullScreenMobile && (
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-0 lg:hidden flex-shrink-0" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

export default BottomSheet;

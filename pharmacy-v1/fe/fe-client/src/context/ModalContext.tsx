import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, HelpCircle } from 'lucide-react'; // Thêm HelpCircle

// Thêm type 'confirm' cho các hành động hỏi ý kiến
type ModalType = 'success' | 'error' | 'warning' | 'confirm';

interface ModalContextType {
  openModal: (
    type: ModalType, 
    title: string, 
    message: string, 
    onConfirm?: () => void,
    confirmLabel?: string, // Label nút Đồng ý
    cancelLabel?: string   // Label nút Hủy
  ) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<ModalType>('success');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // Custom Labels
  const [confirmText, setConfirmText] = useState('Đồng ý');
  const [cancelText, setCancelText] = useState('Hủy');

  const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>(undefined);

  const openModal = (
    modalType: ModalType, 
    modalTitle: string, 
    modalMessage: string, 
    confirmAction?: () => void,
    cLabel: string = 'Đồng ý',
    cnLabel: string = 'Hủy'
  ) => {
    setType(modalType);
    setTitle(modalTitle);
    setMessage(modalMessage);
    setOnConfirm(() => confirmAction);
    setConfirmText(cLabel);
    setCancelText(cnLabel);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setOnConfirm(undefined);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  // Styles Config
  const getModalStyles = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          btnBg: 'bg-green-600 hover:bg-green-700 shadow-green-200',
          icon: <CheckCircle className="w-8 h-8 text-green-600" />
        };
      case 'error':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          btnBg: 'bg-red-600 hover:bg-red-700 shadow-red-200',
          icon: <AlertCircle className="w-8 h-8 text-red-600" />
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          btnBg: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200',
          icon: <AlertTriangle className="w-8 h-8 text-yellow-600" />
        };
      case 'confirm':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
          icon: <HelpCircle className="w-8 h-8 text-blue-600" />
        };
      default:
        return { iconBg: '', iconColor: '', btnBg: '', icon: null };
    }
  };

  const styles = getModalStyles();
  const showCancel = type === 'warning' || type === 'confirm';

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className={`p-6 flex justify-center ${styles.iconBg}`}>
              <div className="bg-white p-3 rounded-full shadow-sm">
                {styles.icon}
              </div>
            </div>
            
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">{message}</p>
              
              <div className="flex gap-3">
                {showCancel && (
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    {cancelText}
                  </button>
                )}
                
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-white transition transform active:scale-95 shadow-lg ${styles.btnBg}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};
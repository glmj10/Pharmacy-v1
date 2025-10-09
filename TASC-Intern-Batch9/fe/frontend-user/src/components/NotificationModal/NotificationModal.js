import React from 'react';
import './NotificationModal.css';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  title = 'Thông báo', 
  message = 'Chức năng đang được phát triển. Vui lòng quay lại sau.', 
  buttonText = 'Đóng',
  onButtonClick
}) => {
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const getModalClass = () => {
    switch (type) {
      case 'success':
        return 'notification-modal-success';
      case 'error':
        return 'notification-modal-error';
      case 'warning':
        return 'notification-modal-warning';
      case 'info':
        return 'notification-modal-info';
      default:
        return 'notification-modal-success';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  return (
    <div className="notification-modal-overlay" onClick={handleOverlayClick}>
      <div className={`notification-modal ${getModalClass()}`}>
        <div className="notification-modal-header">
          <div className="notification-icon">
            {getIcon()}
          </div>
          <button className="notification-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="notification-modal-body">
          <h2 className="notification-title">{title}</h2>
          <p className="notification-message">{message}</p>
          
          <div className="notification-actions">
            <button 
              className="btn-notification-ok" 
              onClick={handleButtonClick}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Backward compatibility
export const ModalNotification = NotificationModal;
export default NotificationModal;

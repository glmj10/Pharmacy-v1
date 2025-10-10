import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Home from '../Home/Home';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { openLoginModal, setModalType } = useAuthModal();
  const { resetPassword } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token && !isProcessing) {
      setIsProcessing(true);

      window.resetPasswordToken = token;
      
      setModalType('login');
      openLoginModal();
    }
  }, [searchParams, openLoginModal, setModalType, isProcessing]);

  return <Home />;
};

export default ResetPassword;
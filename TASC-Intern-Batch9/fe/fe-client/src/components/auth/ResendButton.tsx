import React, { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

interface ResendButtonProps {
  onResend: () => Promise<void>;
  initialCount?: number;
}

const ResendButton: React.FC<ResendButtonProps> = ({ onResend, initialCount = 60 }) => {
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleClick = async () => {
    if (countdown > 0 || isLoading) return;
    
    setIsLoading(true);
    await onResend();
    setIsLoading(false);
    setCountdown(initialCount);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={countdown > 0 || isLoading}
      className={`text-sm font-medium flex items-center gap-1 transition ${
        countdown > 0 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-primary hover:underline hover:text-blue-700'
      }`}
    >
      {isLoading ? (
        <RotateCw className="w-3 h-3 animate-spin" />
      ) : (
        countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'
      )}
    </button>
  );
};

export default ResendButton;
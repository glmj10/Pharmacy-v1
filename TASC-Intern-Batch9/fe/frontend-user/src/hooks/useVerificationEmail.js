import { useState } from 'react';
import { handleVerificationEmailError } from './errorHandler';

/**
 * Custom hook for handling verification email operations with improved error handling
 * @param {Function} sendVerificationEmailFn - Function to send verification email
 * @returns {Object} Hook state and functions
 */
export const useVerificationEmail = (sendVerificationEmailFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const sendEmail = async (email, maxRetries = 3) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendVerificationEmailFn(email);
      setSuccess(true);
      setRetryCount(0);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || handleVerificationEmailError(error);
      setError({
        message: errorMessage,
        canRetry: canRetryError(error),
        isRateLimit: isRateLimitError(error),
        needsEmailCheck: needsEmailCheckError(error)
      });
      
      // Auto-retry for certain errors
      if (canAutoRetry(error) && retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          sendEmail(email, maxRetries);
        }, getRetryDelay(retryCount));
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const retry = (email) => {
    if (error?.canRetry) {
      sendEmail(email);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setRetryCount(0);
  };

  return {
    loading,
    error,
    success,
    retryCount,
    sendEmail,
    retry,
    reset
  };
};

/**
 * Check if error can be retried by user
 */
const canRetryError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message?.toLowerCase() || '';
  
  // Don't retry for these conditions
  const noRetryConditions = [
    status === 409, // Already verified 
    status === 404, // Email not found
    message.includes('already verified'),
    message.includes('not found'),
    message.includes('invalid email')
  ];
  
  return !noRetryConditions.some(condition => condition);
};

/**
 * Check if error is due to rate limiting
 */
const isRateLimitError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message?.toLowerCase() || '';
  
  return status === 429 || 
         message.includes('rate limit') || 
         message.includes('too many requests');
};

/**
 * Check if error suggests user should check their email
 */
const needsEmailCheckError = (error) => {
  const message = error.response?.data?.message?.toLowerCase() || '';
  
  return message.includes('not found') || 
         message.includes('invalid email');
};

/**
 * Check if error can be auto-retried
 */
const canAutoRetry = (error) => {
  const status = error.response?.status;
  
  // Only auto-retry for server errors and timeouts
  return status >= 500 || 
         error.code === 'ECONNABORTED' || 
         !error.response; // Network errors
};

/**
 * Get retry delay with exponential backoff
 */
const getRetryDelay = (retryCount) => {
  return Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
};

export default useVerificationEmail;
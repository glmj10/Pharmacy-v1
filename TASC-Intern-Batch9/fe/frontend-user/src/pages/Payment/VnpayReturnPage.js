import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';

const VnpayReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramObj = {};
    for (const [key, value] of params.entries()) {
      paramObj[key] = value;
    }

    // Set timeout for 20 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        setIsTimeout(true);
        setLoading(false);
        setResult({ 
          status: 408, 
          message: 'Quá thời gian chờ xác thực thanh toán. Vui lòng kiểm tra lại trạng thái đơn hàng hoặc liên hệ hỗ trợ.' 
        });
      }
    }, 20000); // 20 seconds

    paymentService.paymentVNPAYReturn(paramObj)
      .then(res => {
        clearTimeout(timeoutId);
        setResult(res);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setResult({ status: 500, message: 'Có lỗi xảy ra khi xác thực thanh toán.' });
      })
      .finally(() => setLoading(false));

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.search]);

  const [showModal, setShowModal] = useState(false);

  // Prevent user navigation during payment verification
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (loading) {
        e.preventDefault();
        e.returnValue = 'Đang xác thực thanh toán. Bạn có chắc chắn muốn rời khỏi trang này?';
        return 'Đang xác thực thanh toán. Bạn có chắc chắn muốn rời khỏi trang này?';
      }
    };

    const handlePopState = (e) => {
      if (loading) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        return false;
      }
    };

    if (loading) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      // Push current state to prevent back navigation
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loading]);

  useEffect(() => {
    if (!loading && result?.status === 200) {
      setShowModal(true);
    }
  }, [loading, result]);

  // Disable ESC key during loading
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (loading) {
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [loading]);

  return (
    <>
      {/* Modal for loading/verification */}
      {loading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()} // Prevent any click events
        >
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: '40px 32px', 
            minWidth: 340, 
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)', 
            textAlign: 'center',
            animation: 'fadeIn 0.5s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
            <h2 style={{ color: '#1976d2', marginBottom: 12, fontSize: 24, fontWeight: 600 }}>
              Đang xác thực thanh toán...
            </h2>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 0 }}>
              Vui lòng đợi trong giây lát, không tắt trình duyệt
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
      
      {/* Modal for success */}
      {!loading && showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center', position: 'relative', animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'popV 0.7s cubic-bezier(.17,.67,.83,.67) both' }}>
                <circle cx="48" cy="48" r="48" fill="#4caf50"/>
                <path d="M28 50L43 65L68 40" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#4caf50', marginBottom: 12, fontSize: 28, fontWeight: 700 }}>Thanh toán thành công!</h2>
            <p style={{ fontSize: 16, marginBottom: 18 }}>{result.data || 'Vui lòng kiểm tra email để xem chi tiết đơn hàng'}</p>
            <button
              style={{ marginTop: 10, padding: '12px 32px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 18 }}
              onClick={() => { setShowModal(false); navigate('/orders'); }}
            >Quay về đơn hàng</button>
            <style>{`
              @keyframes popV {
                0% { transform: scale(0.5); opacity: 0; }
                60% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
      {/* Fallback for failure */}
      {!loading && !showModal && result?.status !== 200 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center', position: 'relative', animation: 'fadeIn 0.5s' }}>
            {isTimeout ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="48" cy="48" r="48" fill="#ff9800"/>
                    <path d="M48 20V52L62 66" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="48" cy="76" r="4" fill="#fff"/>
                  </svg>
                </div>
                <h2 style={{ color: '#ff9800', marginBottom: 12, fontSize: 28, fontWeight: 700 }}>Quá thời gian chờ!</h2>
                <p style={{ fontSize: 16, marginBottom: 18 }}>{result?.message}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    style={{ 
                      padding: '12px 24px', 
                      background: '#ff9800', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 8, 
                      fontWeight: 500, 
                      cursor: 'pointer', 
                      fontSize: 16 
                    }}
                    onClick={() => window.location.reload()}
                  >Thử lại</button>
                  <button
                    style={{ 
                      padding: '12px 24px', 
                      background: '#1976d2', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 8, 
                      fontWeight: 500, 
                      cursor: 'pointer', 
                      fontSize: 16 
                    }}
                    onClick={() => navigate('/orders')}
                  >Xem đơn hàng</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="48" cy="48" r="48" fill="#d32f2f"/>
                    <path d="M32 32L64 64M32 64L64 32" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 style={{ color: '#d32f2f', marginBottom: 12, fontSize: 28, fontWeight: 700 }}>Thanh toán thất bại!</h2>
                <p style={{ fontSize: 16, marginBottom: 18 }}>{result?.message || 'Có lỗi xảy ra khi xác thực thanh toán.'}</p>
                <button
                  style={{ marginTop: 10, padding: '12px 32px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 18 }}
                  onClick={() => navigate('/')}
                >Quay về trang chủ</button>
              </>
            )}
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
};

export default VnpayReturnPage;

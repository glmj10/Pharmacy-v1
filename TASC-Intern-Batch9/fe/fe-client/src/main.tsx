import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { store } from './store/store.ts';
import './index.css';
import { ModalProvider } from './context/ModalContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
    <Provider store={store}>
      <ToastProvider> 
        <ModalProvider>
          <WishlistProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </WishlistProvider>
        </ModalProvider>
      </ToastProvider>
    </Provider>
  </React.StrictMode>,
)
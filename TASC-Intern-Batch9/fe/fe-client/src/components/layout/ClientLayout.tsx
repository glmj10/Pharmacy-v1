import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import VirtualPharmacist from '../chat/VirtualPharmacist'; // <== Import

const ClientLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      
      {/* NHÚNG DƯỢC SĨ ẢO VÀO ĐÂY */}
      <VirtualPharmacist />
      
    </div>
  );
};

export default ClientLayout;
import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="pt-14 pb-16 md:pb-0 md:pl-56">
        <div className="mx-auto max-w-2xl">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;

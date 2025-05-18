import React, { ReactNode } from 'react';
import Navbar from './Navbar';
// import Sidebar from './Sidebar'; // Удаляем импорт Sidebar

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-dark-background">
      <Navbar /> {/* Navbar теперь будет сам управлять своим позиционированием (sticky) */}
      {/* Удаляем flex-контейнер для Sidebar и main */}
      <main className="flex-1 p-4 md:p-6 overflow-auto text-gray-900 dark:text-dark-text">
        {/* Содержимое страницы будет использовать цвет текста из body или этот, если переопределен */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
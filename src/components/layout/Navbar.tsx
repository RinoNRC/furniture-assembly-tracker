import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileSpreadsheet, Settings, LogOut, Sun, Moon, MapPin } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser, theme, toggleTheme } = useAppContext();
  
  const [displayedTitle, setDisplayedTitle] = useState('');
  const fullTitle = "FurniTrack";
  const typingSpeed = 150; // ms per character
  const deletingSpeed = 100; // ms per character
  const pauseDuration = 2000; // ms to pause after typing/deleting

  useEffect(() => {
    let currentTimeout: NodeJS.Timeout;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      if (isDeleting) {
        if (charIndex > 0) {
          setDisplayedTitle(fullTitle.substring(0, charIndex - 1));
          charIndex--;
          currentTimeout = setTimeout(type, deletingSpeed);
        } else {
          // Finished deleting
          isDeleting = false;
          currentTimeout = setTimeout(type, pauseDuration / 2); // Shorter pause before re-typing
        }
      } else {
        if (charIndex < fullTitle.length) {
          setDisplayedTitle(fullTitle.substring(0, charIndex + 1));
          charIndex++;
          currentTimeout = setTimeout(type, typingSpeed);
        } else {
          // Finished typing
          isDeleting = true;
          currentTimeout = setTimeout(type, pauseDuration);
        }
      }
    };

    currentTimeout = setTimeout(type, pauseDuration / 2); // Start typing after a short initial pause

    return () => clearTimeout(currentTimeout); // Cleanup on unmount
  }, []); // Empty dependency array to run only once on mount
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav 
      className="sticky top-0 z-50 bg-indigo-900/80 dark:bg-gray-900/80 text-white shadow-md backdrop-blur-md font-publicpixel"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <span className="font-publicpixel text-xl text-white dark:text-gray-100 transition-colors duration-300 ease-in-out">
                {displayedTitle}
                <span className="animate-pulse">|</span> 
              </span>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-indigo-700 dark:bg-indigo-600 text-white' : 'text-gray-300 dark:text-gray-400 hover:bg-indigo-800 dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-200'}`
                }
              >
                <LayoutDashboard className="mr-1 h-4 w-4" />
                Панель
              </NavLink>
              <NavLink
                to="/employees"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-indigo-700 dark:bg-indigo-600 text-white' : 'text-gray-300 dark:text-gray-400 hover:bg-indigo-800 dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-200'}`
                }
              >
                <Users className="mr-1 h-4 w-4" />
                Сотрудники
              </NavLink>
              <NavLink
                to="/assembly-records"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-indigo-700 dark:bg-indigo-600 text-white' : 'text-gray-300 dark:text-gray-400 hover:bg-indigo-800 dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-200'}`
                }
              >
                <FileSpreadsheet className="mr-1 h-4 w-4" />
                Учёт
              </NavLink>
              <NavLink
                to="/locations"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-indigo-700 dark:bg-indigo-600 text-white' : 'text-gray-300 dark:text-gray-400 hover:bg-indigo-800 dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-200'}`
                }
              >
                <MapPin className="mr-1 h-4 w-4" />
                Объекты
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-indigo-700 dark:bg-indigo-600 text-white' : 'text-gray-300 dark:text-gray-400 hover:bg-indigo-800 dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-200'}`
                }
              >
                <Settings className="mr-1 h-4 w-4" />
                Настройки
              </NavLink>
              
              {/* Профиль пользователя и кнопка выхода */}
              <div className="ml-4 flex items-center">
                {/* Переключатель темы */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-300 dark:text-gray-400 hover:bg-indigo-800 dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-200 transition-colors duration-150 mr-2"
                  title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <div className="border-l border-indigo-700 dark:border-gray-600 pl-4 flex items-center">
                  <span className="text-sm text-gray-300 dark:text-gray-400 mr-2">
                    {currentUser?.name || 'Пользователь'}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-indigo-800 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-indigo-700 dark:hover:bg-gray-600 transition-colors duration-150"
                    title="Выйти"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="block md:hidden">
            {/* Кнопка для мобильного меню (пока не реализовано) */}
            <div className="flex items-center">
                {/* Переключатель темы для мобильной версии */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-indigo-200 dark:text-gray-400 hover:bg-indigo-800 dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-200 transition-colors duration-150 mr-2"
                  title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
                <button className="flex items-center px-3 py-2 border rounded text-indigo-200 dark:text-gray-400 border-indigo-400 dark:border-gray-500 hover:text-white dark:hover:text-gray-200 hover:border-white dark:hover:border-gray-300">
                    <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <title>Меню</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
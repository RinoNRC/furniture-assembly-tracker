import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, AlertTriangle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(credentials.email, credentials.password);
    
    if (success) {
      navigate('/');
    } else {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-400 font-publicpixel">FurniTrack</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Система учета сборки мебели</p>
        </div>
        
        <Card>
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900 dark:text-dark-text">Вход в систему</h2>
          
          {error && (
            <div className="flex items-center mb-4 p-3 bg-red-100 dark:bg-red-700 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 rounded">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="admin@furnitrack.com"
              icon={Mail}
            />
            
            <Input
              label="Пароль"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="••••••••"
              icon={Lock}
            />
            
            <div className="text-sm text-right">
              <a 
                href="#" 
                className="text-indigo-600 dark:text-indigo-400 opacity-70 hover:opacity-100 dark:hover:opacity-90 cursor-not-allowed"
                onClick={(e) => e.preventDefault()}
              >
                Забыли пароль?
              </a>
            </div>
            
            <Button type="submit" className="w-full">
              Войти
            </Button>
            
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Тестовые данные для входа:</p>
              <p>Email: admin@furnitrack.com</p>
              <p>Пароль: admin123</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login; 
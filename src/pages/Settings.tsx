import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { getAppSettings, saveAppSettings, AppSettings } from '../services/SettingsService';
import { useAppContext } from '../context/AppContext';

const Settings: React.FC = () => {
  const { theme } = useAppContext();
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleAppSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setAppSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' ? Number(value) : value
    }));
  };
  
  const handleAppSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveAppSettings(appSettings);
      setSuccessMessage('Настройки приложения успешно сохранены');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Ошибка при сохранении настроек приложения');
      setSuccessMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Настройки</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Управление настройками приложения</p>
      </div>
      
      {successMessage && (
        <div className={`border px-4 py-3 rounded relative mb-4 ${theme === 'dark' ? 'bg-green-700 border-green-600 text-green-100' : 'bg-green-100 border-green-400 text-green-700'}`}>
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className={`border px-4 py-3 rounded relative mb-4 ${theme === 'dark' ? 'bg-red-700 border-red-600 text-red-100' : 'bg-red-100 border-red-400 text-red-700'}`}>
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {/* Настройки приложения */}
        <Card title="Настройки приложения" className={`${theme === 'dark' ? 'bg-dark-card' : ''}`}>
          <form onSubmit={handleAppSettingsSubmit} className="space-y-4">
            <Input
              label="Название компании"
              name="companyName"
              value={appSettings.companyName}
              onChange={handleAppSettingsChange}
              fullWidth
            />
            
            <Input
              label="Ставка налога (%)"
              name="taxRate"
              type="number"
              min="0"
              max="100"
              value={appSettings.taxRate}
              onChange={handleAppSettingsChange}
              fullWidth
            />
            
            <Select
              label="Валюта по умолчанию"
              name="defaultCurrency"
              value={appSettings.defaultCurrency}
              onChange={handleAppSettingsChange}
              options={[
                { value: 'RUB', label: 'Российский рубль (₽)' },
                { value: 'USD', label: 'Доллар США ($)' },
                { value: 'EUR', label: 'Евро (€)' }
              ]}
              fullWidth
            />
            
            <Select
              label="Язык интерфейса"
              name="language"
              value={appSettings.language}
              onChange={handleAppSettingsChange}
              options={[
                { value: 'ru', label: 'Русский' },
                { value: 'en', label: 'English' }
              ]}
              fullWidth
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnLowStock"
                name="notifyOnLowStock"
                checked={appSettings.notifyOnLowStock}
                onChange={handleAppSettingsChange}
                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:ring-offset-gray-800' : ''}`}
              />
              <label htmlFor="notifyOnLowStock" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Уведомлять о низком запасе материалов
              </label>
            </div>
            
            <Button type="submit" className="mt-4">
              Сохранить изменения
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
// import Select from '../components/ui/Select'; // Удаляем, если не используется для новых полей
// import { getAppSettings, saveAppSettings, AppSettings } from '../services/SettingsService'; // Удаляем старый сервис
import { useAppContext } from '../context/AppContext';
import { AppSettings } from '../types'; // Импортируем тип AppSettings
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { theme, appSettings: contextAppSettings, updateAppSettings, isLoading } = useAppContext();
  
  // Локальное состояние для формы, инициализируется из контекста
  const [formSettings, setFormSettings] = useState<Partial<AppSettings>>({
    companyName: '',
    defaultPercentage: 0,
  });

  // Эффект для обновления локального состояния формы при изменении appSettings в контексте
  useEffect(() => {
    if (contextAppSettings) {
      setFormSettings({
        companyName: contextAppSettings.companyName || '',
        defaultPercentage: contextAppSettings.defaultPercentage || 0,
      });
    } else {
      // Если в контексте нет настроек (например, еще не загружены или не созданы на бэке)
      // можно установить значения по умолчанию для формы
      setFormSettings({ companyName: '', defaultPercentage: 0 });
    }
  }, [contextAppSettings]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setFormSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Проверяем, что все необходимые поля заполнены
    if (formSettings.companyName === undefined || formSettings.defaultPercentage === undefined) {
        toast.error('Пожалуйста, заполните все поля настроек.');
        return;
    }

    // ID для настроек всегда 1, как определено на бэкенде
    const settingsToUpdate: AppSettings = {
        id: 1, 
        companyName: formSettings.companyName,
        defaultPercentage: formSettings.defaultPercentage,
    };

    const toastId = toast.loading('Сохранение настроек...');
    try {
      await updateAppSettings(settingsToUpdate);
      // Сообщение об успехе уже показывается в AppContext
      // toast.success('Настройки успешно сохранены!', { id: toastId });
      toast.dismiss(toastId); // Закрываем только индикатор загрузки
    } catch (error) {
      // Сообщение об ошибке уже показывается в AppContext
      // toast.error('Ошибка при сохранении настроек.', { id: toastId });
       toast.dismiss(toastId); // Закрываем только индикатор загрузки
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Настройки Приложения</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Управление названием компании и процентом по умолчанию для расчета зарплат.</p>
      </div>
      
      <Card title="Основные настройки" className={`${theme === 'dark' ? 'bg-dark-card' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Название компании"
              name="companyName"
              value={formSettings.companyName || ''} // Обеспечиваем, чтобы value не был undefined
              onChange={handleInputChange}
              fullWidth
              disabled={isLoading}
            />
            
            <Input
              label="Процент по умолчанию для расчета ЗП (%)"
              name="defaultPercentage"
              type="number"
              min="0"
              max="100"
              step="0.01" // Для возможности ввода дробных процентов
              value={formSettings.defaultPercentage || 0} // Обеспечиваем, чтобы value не был undefined
              onChange={handleInputChange}
              fullWidth
              disabled={isLoading}
            />
            
            <Button type="submit" className="mt-4" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </form>
        </Card>
    </div>
  );
};

export default Settings; 
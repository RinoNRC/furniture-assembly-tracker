import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { Location } from '../types';

const LocationManagement: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation, isLoading, theme } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Location>>({
    name: '',
    address: '',
    contactPerson: '',
    contactInfo: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Состояния для анимации основного модального окна
  const [isModalActuallyVisible, setIsModalActuallyVisible] = useState(false);
  const [modalAnimationClass, setModalAnimationClass] = useState("opacity-0 scale-95");
  const [backdropAnimationClass, setBackdropAnimationClass] = useState("bg-transparent");
  
  // Состояния для кастомных диалогов
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [locationIdToDelete, setLocationIdToDelete] = useState<string | null>(null);

  // Локальное состояние для индикатора загрузки в модальном окне
  const [localLoading, setLocalLoading] = useState(false);
  // Локальное состояние для ошибок в модальном окне
  const [localError, setLocalError] = useState<string | null>(null);

  // useEffect для управления анимацией основного модального окна
  useEffect(() => {
    if (isModalOpen) {
      setIsModalActuallyVisible(true);
      requestAnimationFrame(() => {
        setBackdropAnimationClass("bg-black bg-opacity-50 dark:bg-opacity-75");
        setModalAnimationClass("opacity-100 scale-100");
      });
    } else {
      setBackdropAnimationClass("bg-transparent");
      setModalAnimationClass("opacity-0 scale-95");
      const timer = setTimeout(() => {
        setIsModalActuallyVisible(false);
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);
    try {
      const locationData = {
        ...currentLocation,
        name: currentLocation.name || '',
        address: currentLocation.address || '',
        contactPerson: currentLocation.contactPerson || '',
        contactInfo: currentLocation.contactInfo || '',
        notes: currentLocation.notes || ''
      };
      
      if (isEditing && currentLocation.id) {
        await updateLocation(locationData as Location);
      } else {
        await addLocation(locationData as Omit<Location, 'id'>);
      }
      handleCloseModal();
    } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении объекта.');
    } finally {
        setLocalLoading(false);
    }
  };

  const handleOpenModal = (location?: Location) => {
    setLocalError(null); // Сбрасываем ошибку при открытии
    if (location) {
      setCurrentLocation({
        ...location,
        name: location.name || '',
        address: location.address || '',
        contactPerson: location.contactPerson || '',
        contactInfo: location.contactInfo || '',
        notes: location.notes || ''
      });
      setIsEditing(true);
    } else {
      setCurrentLocation({
        name: '',
        address: '',
        contactPerson: '',
        contactInfo: '',
        notes: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Не сбрасываем currentLocation и isEditing здесь, 
    // чтобы данные не пропадали во время анимации закрытия
    // Они сбросятся при следующем открытии, если это не редактирование
  };

  // Обработчик для открытия диалога подтверждения удаления
  const handleDeleteConfirmation = (id: string) => {
    setLocationIdToDelete(id);
    setConfirmDialogMessage('Вы уверены, что хотите удалить этот объект? Все связанные записи о сборке останутся, но потеряют связь с объектом.');
    setIsConfirmDialogOpen(true);
  };

  // Обработчик для фактического удаления после подтверждения
  const handleConfirmDelete = async () => {
    if (locationIdToDelete) {
      setLocalLoading(true); // Индикатор на время удаления
      setLocalError(null);
      try {
        await deleteLocation(locationIdToDelete);
      } catch (err) {
         setLocalError(err instanceof Error ? err.message : 'Ошибка при удалении объекта.');
      } finally {
        setLocalLoading(false);
      }
      setLocationIdToDelete(null);
    }
    setIsConfirmDialogOpen(false);
  };

  // Обработчик для отмены удаления
  const handleCancelDelete = () => {
    setLocationIdToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Управление объектами</h1>
          <p className="text-gray-500 dark:text-gray-400">Места, где выполняются работы по сборке</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center"
          disabled={isLoading || localLoading}
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить объект
        </Button>
      </div>

      {isLoading && !isModalOpen && ( // Показываем глобальный лоадер только если не открыто модальное окно
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка данных...</p>
        </div>
      )}

      {/* Locations List */}
      {locations?.length === 0 && !isLoading ? (
        <Card>
          <div className="text-center py-8 text-gray-900 dark:text-dark-text">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Объекты еще не добавлены</p>
            <Button
              onClick={() => handleOpenModal()}
              className="flex items-center mx-auto"
              disabled={isLoading || localLoading}
            >
              <Plus className="mr-1 h-4 w-4" />
              Добавить первый объект
            </Button>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-dark-card shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Адрес
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Контактное лицо
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Контактная информация
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
              {locations?.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {location.contactPerson || 'Не указано'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {location.contactInfo || 'Не указан'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(location)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        disabled={localLoading} // Блокируем, если идет операция в модалке
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirmation(location.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        disabled={localLoading} // Блокируем, если идет операция в модалке
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно добавления/редактирования */}
      {isModalActuallyVisible && (
        <div
          className={[
            "fixed inset-0 flex items-center justify-center z-50 p-4",
            "transition-opacity duration-300 ease-in-out",
            backdropAnimationClass,
          ].join(" ")}
          onClick={handleCloseModal} // Закрытие по клику на фон
        >
          <div
            className={[
              "rounded-lg shadow-xl w-full max-w-4xl",
              theme === 'dark' ? 'bg-gray-700' : 'bg-white',
              "transition-all duration-300 ease-in-out",
              modalAnimationClass,
            ].join(" ")}
            onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие по клику на саму модалку
          >
            <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'} px-6 py-4`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                {isEditing ? 'Редактировать объект' : 'Добавить новый объект'}
              </h3>
              <button
                onClick={handleCloseModal}
                className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
                disabled={localLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Название объекта"
                  name="name"
                  value={currentLocation.name || ''}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="Введите название объекта"
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <Input
                  label="Адрес"
                  name="address"
                  value={currentLocation.address || ''}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="Например, ул. Ленина, 1"
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <Input
                  label="Контактное лицо"
                  name="contactPerson"
                  value={currentLocation.contactPerson || ''}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="ФИО представителя на объекте (необязательно)"
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <Input
                  label="Контактная информация"
                  name="contactInfo"
                  value={currentLocation.contactInfo || ''}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Телефон, email и т.д. (необязательно)"
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <div className="mb-4">
                  <label htmlFor="notes" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Примечания (необязательно)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={currentLocation.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm 
                                placeholder-gray-400 dark:placeholder-gray-500 
                                focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 
                                text-sm
                                ${theme === 'dark' ? 'bg-gray-700 text-dark-text border-dark-border' : 'bg-white text-gray-900 border-gray-300'}`}
                    placeholder="Дополнительная информация об объекте..."
                  />
                </div>
              </div>
              {localError && (
                <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
                  <strong className="font-bold">Ошибка! </strong>
                  <span className="block sm:inline">{localError}</span>
                </div>
              )}
              {localLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                  <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Обработка...</p>
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCloseModal}
                  disabled={localLoading}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={localLoading || isLoading} // Блокируем, если идет глобальная загрузка или локальная
                >
                  {isEditing ? 'Сохранить' : 'Добавить'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Кастомный диалог подтверждения */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl w-full max-w-md p-6 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Подтвердите действие</h3>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{confirmDialogMessage}</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={handleCancelDelete}
                disabled={localLoading}
              >
                Отмена
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={localLoading}
              >
                {localLoading ? 'Удаление...' : 'Удалить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement; 
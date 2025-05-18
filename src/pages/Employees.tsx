import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import { Plus, Edit, Trash2, X, Users } from 'lucide-react';
import { Employee } from '../types';
import Input from '../components/ui/Input';
import { format, parseISO } from 'date-fns';

const Employees: React.FC = () => {
  // console.log('[Employees Component] Function body executing');

  const { 
    employees, 
    addEmployee,
    updateEmployee,
    deleteEmployee,
    isLoading,
    theme
  } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({
    name: '',
    position: '',
    rate: 0,
    hireDate: format(new Date(), 'yyyy-MM-dd'),
    contactInfo: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Состояние для управления видимостью в DOM (для анимации закрытия)
  const [isModalActuallyVisible, setIsModalActuallyVisible] = useState(false);
  // Состояние для управления классами анимации (открыто/закрыто)
  const [modalAnimationClass, setModalAnimationClass] = useState("opacity-0 scale-95");
  const [backdropAnimationClass, setBackdropAnimationClass] = useState("bg-transparent");

  // Локальное состояние для индикатора загрузки
  const [localLoading, setLocalLoading] = useState(false);
  // Локальное состояние для ошибок
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setCurrentEmployee(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Включаем локальный индикатор загрузки
    setLocalLoading(true);
    setLocalError(null);
    
    try {
      if (isEditing && currentEmployee.id) {
        await updateEmployee(currentEmployee as Employee);
        // console.log('Employee updated:', currentEmployee);
      } else {
        // Убеждаемся, что все обязательные поля заполнены
        const employeeData = {
          name: currentEmployee.name || '',
          position: currentEmployee.position || '',
          rate: currentEmployee.rate || 0,
          hireDate: currentEmployee.hireDate || format(new Date(), 'yyyy-MM-dd'),
          contactInfo: currentEmployee.contactInfo || '',
          // Добавим дополнительные поля, требуемые интерфейсом Employee
          joinDate: currentEmployee.hireDate || format(new Date(), 'yyyy-MM-dd'),
        };
        
        console.log('Отправка данных сотрудника:', employeeData);
        await addEmployee(employeeData as Omit<Employee, 'id'>);
        // console.log('Employee added:', employeeData);
      }
      
      // Если запрос выполнен успешно, закрываем модальное окно
      handleCloseModal();
    } catch (err) {
      // Обрабатываем локальную ошибку
      setLocalError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setCurrentEmployee(employee);
      setIsEditing(true);
    } else {
      setCurrentEmployee({
        name: '',
        position: '',
        rate: 0,
        hireDate: format(new Date(), 'yyyy-MM-dd'),
        contactInfo: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      setIsModalActuallyVisible(true);
      // Запускаем анимацию открытия
      requestAnimationFrame(() => {
        setBackdropAnimationClass("bg-black bg-opacity-50 dark:bg-opacity-75");
        setModalAnimationClass("opacity-100 scale-100");
      });
    } else {
      // Запускаем анимацию закрытия
      setBackdropAnimationClass("bg-transparent");
      setModalAnimationClass("opacity-0 scale-95");
      // Убираем из DOM после завершения анимации
      const timer = setTimeout(() => {
        setIsModalActuallyVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      setLocalLoading(true);
      try {
        await deleteEmployee(id);
        // console.log('Employee deleted with ID:', id);
      } catch (err) {
        // Обрабатываем ошибку
        console.error('Ошибка при удалении сотрудника:', err);
        setLocalError(err instanceof Error ? err.message : 'Ошибка при удалении сотрудника');
      } finally {
        setLocalLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Сотрудники</h1>
          <p className="text-gray-500 dark:text-gray-400">Управляйте сотрудниками вашей компании</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center"
          disabled={isLoading || localLoading}
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить сотрудника
        </Button>
      </div>

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка данных...</p>
        </div>
      )}

      {/* Заменяем Card на div со стилями как в LocationManagement.tsx */}
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden">
        {employees.length === 0 && !isLoading ? (
          <div className="text-center py-12 px-6">
            <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-dark-text">Сотрудники отсутствуют</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Начните с добавления первого сотрудника в вашу команду.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => handleOpenModal()}
                className="flex items-center mx-auto"
                disabled={isLoading || localLoading}
              >
                <Plus className="mr-2 h-5 w-5" />
                Добавить сотрудника
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Имя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Должность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ставка за ед.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Дата найма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Контакты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.rate} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(employee.hireDate), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.contactInfo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(employee)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          disabled={isLoading || localLoading}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          disabled={isLoading || localLoading}
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
      </div>

      {/* Модальное окно добавления/редактирования */}
      {isModalActuallyVisible && (
        <div 
          className={[
            "fixed inset-0 flex items-center justify-center z-50 p-4",
            "transition-opacity duration-300 ease-in-out",
            backdropAnimationClass
          ].join(' ')}
          onClick={handleCloseModal}
        >
          <div 
            className={[
              `rounded-lg shadow-xl w-full max-w-4xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`,
              "transition-all duration-300 ease-in-out",
              modalAnimationClass
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center border-b px-6 py-4 ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
              <h3 
                className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}
              >
                {isEditing ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
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
                  label="Имя"
                  name="name"
                  value={currentEmployee.name || ''}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="Иван Иванов"
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <Input
                  label="Должность"
                  name="position"
                  value={currentEmployee.position || ''}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="Сборщик"
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <Input
                  label="Ставка за единицу (₽)"
                  name="rate"
                  type="number"
                  value={currentEmployee.rate || 0}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  min="0"
                  placeholder="100"
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <Input
                  label="Дата найма"
                  name="hireDate"
                  type="date"
                  value={currentEmployee.hireDate || ''}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                />
                <div>
                  <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Контактная информация
                  </label>
                  <textarea
                    id="contactInfo"
                    name="contactInfo"
                    value={currentEmployee.contactInfo || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-text 
                               placeholder-gray-400 dark:placeholder-gray-500 
                               focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm"
                    placeholder="Телефон, email и т.д."
                  />
                </div>
              </div>
              {/* Локальные ошибки и индикатор загрузки в модальном окне */}
              {localError && (
                <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
                  <strong className="font-bold">Ошибка! </strong>
                  <span className="block sm:inline">{localError}</span>
                </div>
              )}
              {localLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Обработка...</p>
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
                  disabled={isLoading || localLoading}
                >
                  {isEditing ? 'Сохранить' : 'Добавить'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees; 
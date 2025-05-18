import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Employee } from '../types';

const EmployeeManagement: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, isLoading } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({
    name: '',
    position: '',
    hourlyRate: 0,
    joinDate: new Date().toISOString().split('T')[0],
    contactNumber: '',
    rate: 0,
    hireDate: new Date().toISOString().split('T')[0],
    contactInfo: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentEmployee(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value,
      ...(name === 'joinDate' ? { hireDate: value } : {}),
      ...(name === 'contactNumber' ? { contactInfo: value } : {})
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeData = {
      ...currentEmployee,
      name: currentEmployee.name || '',
      position: currentEmployee.position || '',
      hourlyRate: currentEmployee.hourlyRate || 0,
      joinDate: currentEmployee.joinDate || new Date().toISOString().split('T')[0],
      contactNumber: currentEmployee.contactNumber || '',
      rate: currentEmployee.rate || 0,
      hireDate: currentEmployee.hireDate || currentEmployee.joinDate || new Date().toISOString().split('T')[0],
      contactInfo: currentEmployee.contactInfo || currentEmployee.contactNumber || ''
    };
    
    if (isEditing && currentEmployee.id) {
      updateEmployee(employeeData as Employee);
    } else {
      addEmployee(employeeData as Omit<Employee, 'id'>);
    }
    
    handleCloseModal();
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setCurrentEmployee({
        ...employee,
        hourlyRate: employee.hourlyRate || 0,
        joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
        contactNumber: employee.contactNumber || '',
        rate: employee.rate || 0,
        hireDate: employee.hireDate || employee.joinDate || new Date().toISOString().split('T')[0],
        contactInfo: employee.contactInfo || employee.contactNumber || ''
      });
      setIsEditing(true);
    } else {
      setCurrentEmployee({
        name: '',
        position: '',
        hourlyRate: 0,
        joinDate: new Date().toISOString().split('T')[0],
        contactNumber: '',
        rate: 0,
        hireDate: new Date().toISOString().split('T')[0],
        contactInfo: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee({
      name: '',
      position: '',
      hourlyRate: 0,
      joinDate: new Date().toISOString().split('T')[0],
      contactNumber: '',
      rate: 0,
      hireDate: new Date().toISOString().split('T')[0],
      contactInfo: ''
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление сотрудниками</h1>
          <p className="text-gray-500">Управление командой сборщиков мебели</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center"
          disabled={isLoading}
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить сотрудника
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Загрузка данных...</p>
        </div>
      )}

      {/* Employees List */}
      {employees.length === 0 && !isLoading ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Сотрудники еще не добавлены</p>
            <Button
              onClick={() => handleOpenModal()}
              className="flex items-center mx-auto"
              disabled={isLoading}
            >
              <Plus className="mr-1 h-4 w-4" />
              Добавить первого сотрудника
            </Button>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Должность
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ставка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата приема
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.rate ? `${employee.rate.toFixed(2)} ₽` : 'Н/Д'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.hireDate || employee.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.contactInfo || employee.contactNumber || 'Не указан'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(employee)}
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={isLoading}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isLoading}
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

      {/* Add/Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
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
                  placeholder="Введите имя сотрудника"
                />
                <Input
                  label="Должность"
                  name="position"
                  value={currentEmployee.position || ''}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="Например, Сборщик мебели"
                />
                <Input
                  label="Ставка (₽)"
                  name="rate"
                  type="number"
                  step="0.01"
                  value={currentEmployee.rate || 0}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  placeholder="Ставка за сборку"
                />
                <Input
                  label="Дата приема"
                  name="hireDate"
                  type="date"
                  value={currentEmployee.hireDate || currentEmployee.joinDate || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                <Input
                  label="Контактная информация"
                  name="contactInfo"
                  value={currentEmployee.contactInfo || currentEmployee.contactNumber || ''}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Номер телефона, email и т.д. (необязательно)"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Загрузка...
                    </>
                  ) : (
                    isEditing ? 'Обновить' : 'Добавить'
                  )} сотрудника
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
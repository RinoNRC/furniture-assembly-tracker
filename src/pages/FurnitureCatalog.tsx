import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { FurnitureItem } from '../types';

const categories = [
  { value: 'bedroom', label: 'Спальня' },
  { value: 'livingroom', label: 'Гостиная' },
  { value: 'diningroom', label: 'Столовая' },
  { value: 'office', label: 'Офис' },
  { value: 'kitchen', label: 'Кухня' },
  { value: 'bathroom', label: 'Ванная' },
  { value: 'outdoor', label: 'Уличная мебель' },
  { value: 'storage', label: 'Хранение' },
  { value: 'other', label: 'Другое' },
];

const FurnitureCatalog: React.FC = () => {
  const { furnitureItems, addFurnitureItem, updateFurnitureItem, deleteFurnitureItem } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<FurnitureItem>>({
    name: '',
    category: '',
    basePrice: 0,
    imageUrl: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'basePrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentItem.id) {
      updateFurnitureItem(currentItem as FurnitureItem);
    } else {
      addFurnitureItem(currentItem as Omit<FurnitureItem, 'id'>);
    }
    
    handleCloseModal();
  };

  const handleOpenModal = (item?: FurnitureItem) => {
    if (item) {
      setCurrentItem(item);
      setIsEditing(true);
    } else {
      setCurrentItem({
        name: '',
        category: '',
        basePrice: 0,
        imageUrl: '',
        description: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem({
      name: '',
      category: '',
      basePrice: 0,
      imageUrl: '',
      description: ''
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот предмет мебели?')) {
      deleteFurnitureItem(id);
    }
  };

  // Function to get a placeholder image based on category
  const getPlaceholderImage = (category: string) => {
    switch (category) {
      case 'bedroom':
        return 'https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&h=350';
      case 'livingroom':
        return 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&h=350';
      case 'diningroom':
        return 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&h=350';
      case 'office':
        return 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&h=350';
      default:
        return 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&h=350';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Каталог мебели</h1>
          <p className="text-gray-500">Управление предметами мебели, которые собирает ваша команда</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить мебель
        </Button>
      </div>

      {/* Furniture Grid */}
      {furnitureItems.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Предметы мебели еще не добавлены</p>
            <Button
              onClick={() => handleOpenModal()}
              className="flex items-center mx-auto"
            >
              <Plus className="mr-1 h-4 w-4" />
              Добавить первый предмет мебели
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {furnitureItems.map((item) => (
            <Card key={item.id} className="flex flex-col h-full overflow-hidden">
              <div className="w-full h-48 bg-gray-200 mb-4 overflow-hidden">
                <img 
                  src={item.imageUrl || getPlaceholderImage(item.category)} 
                  alt={item.name}
                  className="w-full h-full object-cover transition duration-300 transform hover:scale-105"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <div className="mt-1 mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    {categories.find(cat => cat.value === item.category)?.label || item.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description || 'Описание отсутствует.'}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-lg font-bold text-indigo-700">${item.basePrice.toFixed(2)}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1 text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Furniture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Редактировать предмет мебели' : 'Добавить новый предмет мебели'}
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
                  label="Название мебели"
                  name="name"
                  value={currentItem.name}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="Например, Журнальный столик"
                />
                <Select
                  label="Категория"
                  name="category"
                  value={currentItem.category}
                  onChange={handleInputChange}
                  options={categories}
                  required
                  fullWidth
                />
                <Input
                  label="Базовая цена ($)"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  value={currentItem.basePrice || ''}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="Базовая цена за единицу"
                />
                <Input
                  label="URL изображения (необязательно)"
                  name="imageUrl"
                  value={currentItem.imageUrl || ''}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание (необязательно)
                  </label>
                  <textarea
                    name="description"
                    value={currentItem.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Опишите предмет мебели..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                >
                  Отмена
                </Button>
                <Button type="submit">
                  {isEditing ? 'Обновить' : 'Добавить'} предмет мебели
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FurnitureCatalog;
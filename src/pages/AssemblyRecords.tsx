import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Plus, Edit, Trash2, X, Search, Filter, AlertTriangle, ClipboardList, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AssemblyRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getAppSettings } from '../services/SettingsService';
import { format, parseISO, isBefore, isAfter, compareDesc, compareAsc } from 'date-fns';

// Определяем интерфейс для строки мебели в форме
interface FurnitureEntry {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Тип для конфигурации сортировки
interface SortConfig {
  key: keyof AssemblyRecord | 'employeeName' | 'locationName' | 'totalQuantity';
  direction: 'ascending' | 'descending';
}

const AssemblyRecords: React.FC = () => {
  const { 
    employees, 
    locations,
    assemblyRecords, 
    addAssemblyRecord,
    updateAssemblyRecord,
    deleteAssemblyRecord,
  } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Partial<AssemblyRecord>>({
    employeeId: '',
    locationId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  // Новое состояние для записей о мебели
  const [furnitureEntries, setFurnitureEntries] = useState<FurnitureEntry[]>([
    { id: uuidv4(), name: '', quantity: 1, price: 0 }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  
  // Получаем ставку налога из настроек
  const [taxRate, setTaxRate] = useState(0);
  
  // Состояния для кастомных диалогов
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState('');
  
  // Состояния для анимации основного модального окна
  const [isModalActuallyVisible, setIsModalActuallyVisible] = useState(false);
  const [modalAnimationClass, setModalAnimationClass] = useState("opacity-0 scale-95");
  const [backdropAnimationClass, setBackdropAnimationClass] = useState("bg-transparent");

  // Filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    employeeId: '',
    locationId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Состояние для сортировки
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: 'date',
    direction: 'descending'
  });

  // Состояния для НОВОГО модального окна "Детализация позиций"
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<AssemblyRecord | null>(null);
  const [isItemDetailsModalActuallyVisible, setIsItemDetailsModalActuallyVisible] = useState(false);
  const [itemDetailsModalAnimationClass, setItemDetailsModalAnimationClass] = useState("opacity-0 scale-95");
  const [itemDetailsBackdropAnimationClass, setItemDetailsBackdropAnimationClass] = useState("bg-transparent");

  useEffect(() => {
    const settings = getAppSettings();
    setTaxRate(settings.taxRate);
  }, []);

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

  // useEffect для анимации НОВОГО модального окна "Детализация позиций"
  useEffect(() => {
    if (isItemDetailsModalOpen) {
      setIsItemDetailsModalActuallyVisible(true);
      requestAnimationFrame(() => {
        setItemDetailsBackdropAnimationClass("bg-black bg-opacity-50 dark:bg-opacity-75");
        setItemDetailsModalAnimationClass("opacity-100 scale-100");
      });
    } else {
      setItemDetailsBackdropAnimationClass("bg-transparent");
      setItemDetailsModalAnimationClass("opacity-0 scale-95");
      const timer = setTimeout(() => {
        setIsItemDetailsModalActuallyVisible(false);
        // Сбрасываем выбранную запись после закрытия анимации, чтобы избежать показа старых данных при быстром повторном открытии
        if (!isItemDetailsModalOpen) { 
            setSelectedRecordForDetails(null);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isItemDetailsModalOpen]);

  // Эффект для управления прокруткой body при открытии/закрытии основного модального окна
  useEffect(() => {
    if (isModalActuallyVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Очистка при размонтировании компонента
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalActuallyVisible]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFurnitureEntryChange = (
    id: string,
    field: keyof FurnitureEntry,
    value: string | number
  ) => {
    setFurnitureEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { 
              ...entry, 
              [field]: field === 'name' ? value : Number(value) || 0 
            } 
          : entry
      )
    );
  };

  const addFurnitureEntry = () => {
    setFurnitureEntries(prev => [
      ...prev,
      { id: uuidv4(), name: '', quantity: 1, price: 0 }
    ]);
  };

  const removeFurnitureEntry = (id: string) => {
    if (furnitureEntries.length > 1) {
      setFurnitureEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      employeeId: '',
      locationId: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (furnitureEntries.length === 0 || !furnitureEntries.some(entry => entry.name.trim() && entry.quantity > 0)) {
      setAlertDialogMessage('Добавьте хотя бы один вид мебели с названием и количеством!');
      setIsAlertDialogOpen(true);
      return;
    }

    const itemsForRecord = furnitureEntries
      .filter(entry => entry.name.trim() && entry.quantity > 0)
      .map(entry => {
        const priceWithTax = entry.price - (entry.price * taxRate / 100);
        return {
          id: entry.id, 
          name: entry.name.trim(),
          quantity: entry.quantity,
          price: entry.price, 
          priceWithTax: parseFloat(priceWithTax.toFixed(2)),
          totalItemPriceWithTax: parseFloat((priceWithTax * entry.quantity).toFixed(2)),
        };
      });

    if (itemsForRecord.length === 0) {
      setAlertDialogMessage('Не выбрано ни одной корректной позиции мебели.');
      setIsAlertDialogOpen(true);
      return;
    }
    
    const overallTotalPrice = itemsForRecord.reduce((sum, item) => sum + item.totalItemPriceWithTax, 0);

    const mainFurnitureNameForNotes = itemsForRecord.length > 0 ? itemsForRecord[0].name : '';
    const additionalNotes = (currentRecord.notes || '').trim();
    let finalOverallNotes = '';
    if (!mainFurnitureNameForNotes && !additionalNotes) finalOverallNotes = '';
    else if (!mainFurnitureNameForNotes) finalOverallNotes = additionalNotes;
    else if (!additionalNotes) finalOverallNotes = mainFurnitureNameForNotes;
    else finalOverallNotes = `${mainFurnitureNameForNotes} - ${additionalNotes}`;

    const assemblyRecordData: Omit<AssemblyRecord, 'id'> = {
      employeeId: currentRecord.employeeId || '',
      locationId: currentRecord.locationId || '',
      date: currentRecord.date || format(new Date(), 'yyyy-MM-dd'),
      items: itemsForRecord,
      totalPrice: parseFloat(overallTotalPrice.toFixed(2)),
      notes: finalOverallNotes,
    };

    if (isEditing) {
      if (!currentRecord || !currentRecord.id) {
        console.error("Ошибка редактирования: ID текущей записи отсутствует!", currentRecord);
        setAlertDialogMessage("Ошибка: не удалось определить ID редактируемой записи. Обновление отменено.");
        setIsAlertDialogOpen(true);
        return;
      }
      
      const success = await updateAssemblyRecord(currentRecord.id, assemblyRecordData);
      if (success) {
        handleCloseModal();
      }
    } else {
      await addAssemblyRecord(assemblyRecordData);
      handleCloseModal();
    }
  };

  const handleOpenModal = (record?: AssemblyRecord) => { 
    if (record && record.items && record.items.length > 0) { 
      const firstItemName = record.items[0]?.name || 'Неизвестная мебель';
      
      let additionalNotes = record.notes || '';
      if (additionalNotes.startsWith(`${firstItemName} - `)) {
        additionalNotes = additionalNotes.substring(`${firstItemName} - `.length);
      } else if (additionalNotes.startsWith(firstItemName)) {
        additionalNotes = additionalNotes.substring(firstItemName.length).trim();
        if (additionalNotes.startsWith('-')) {
            additionalNotes = additionalNotes.substring(1).trim();
        }
      }
      const { items, id, employeeId, locationId, date, totalPrice } = record;
      setCurrentRecord({
        id,
        employeeId,
        locationId,
        date,
        totalPrice,
        items, 
        notes: additionalNotes, 
      } as AssemblyRecord); 
      
      setIsEditing(true);

      setFurnitureEntries(record.items.map(item => {
        return {
          id: item.id || uuidv4(), 
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price.toFixed(2)) 
        };
      }));
      
    } else { 
      setCurrentRecord({
        employeeId: '',
        locationId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        items: [], 
        totalPrice: 0, 
      } as Omit<AssemblyRecord, 'id'> & { id?: string }); 
      
      setFurnitureEntries([
        { id: uuidv4(), name: '', quantity: 1, price: 0 }
      ]);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRecord({
      employeeId: '',
      locationId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    });
    setFurnitureEntries([
      { id: uuidv4(), name: '', quantity: 1, price: 0 }
    ]);
    setIsEditing(false);
  };

  const handleDeleteConfirmation = (id: string) => {
    setRecordIdToDelete(id);
    setConfirmDialogMessage('Вы уверены, что хотите удалить эту запись о сборке?');
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordIdToDelete) {
      deleteAssemblyRecord(recordIdToDelete);
      setRecordIdToDelete(null);
    }
    setIsConfirmDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setRecordIdToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  // Функция для запроса сортировки
  const requestSort = (key: SortConfig['key']) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Мемоизированный отсортированный и отфильтрованный список записей
  const sortedAndFilteredRecords = useMemo(() => {
    let DUMMY_SORT_FIELD_records = [...assemblyRecords];

    // Apply search term
    if (searchTerm) {
      DUMMY_SORT_FIELD_records = DUMMY_SORT_FIELD_records.filter(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        const searchFields = [
          employee?.name,
          record.notes,
          record.date,
          ...record.items.map(item => item.name)
        ].filter(Boolean).map(field => field?.toLowerCase());
        return searchFields.some(field => field?.includes(searchTerm.toLowerCase()));
      });
    }
    
    // Apply filters
    if (filters.employeeId) {
      DUMMY_SORT_FIELD_records = DUMMY_SORT_FIELD_records.filter(record => record.employeeId === filters.employeeId);
    }
    if (filters.locationId) {
      DUMMY_SORT_FIELD_records = DUMMY_SORT_FIELD_records.filter(record => record.locationId === filters.locationId);
    }
    if (filters.dateFrom) {
      DUMMY_SORT_FIELD_records = DUMMY_SORT_FIELD_records.filter(record => !isBefore(parseISO(record.date), parseISO(filters.dateFrom)));
    }
    if (filters.dateTo) {
      DUMMY_SORT_FIELD_records = DUMMY_SORT_FIELD_records.filter(record => !isAfter(parseISO(record.date), parseISO(filters.dateTo)));
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      DUMMY_SORT_FIELD_records.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'employeeName') {
          aValue = employees.find(emp => emp.id === a.employeeId)?.name.toLowerCase() || '';
          bValue = employees.find(emp => emp.id === b.employeeId)?.name.toLowerCase() || '';
        } else if (sortConfig.key === 'locationName') {
          aValue = locations.find(loc => loc.id === a.locationId)?.name.toLowerCase() || '';
          bValue = locations.find(loc => loc.id === b.locationId)?.name.toLowerCase() || '';
        } else if (sortConfig.key === 'totalQuantity') {
          aValue = a.items.reduce((sum, item) => sum + item.quantity, 0);
          bValue = b.items.reduce((sum, item) => sum + item.quantity, 0);
        } else if (sortConfig.key === 'date') {
          return sortConfig.direction === 'ascending' 
            ? compareAsc(parseISO(a.date), parseISO(b.date))
            : compareDesc(parseISO(a.date), parseISO(b.date));
        } else {
          aValue = a[sortConfig.key as keyof AssemblyRecord];
          bValue = b[sortConfig.key as keyof AssemblyRecord];
        }

        if (aValue === null || aValue === undefined) aValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
        if (bValue === null || bValue === undefined) bValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return DUMMY_SORT_FIELD_records;
  }, [assemblyRecords, searchTerm, filters, sortConfig, employees, locations]);

  // Calculate totals for filtered records
  const totalItems = sortedAndFilteredRecords.reduce((sum, record) => {
    const itemsQuantity = record.items ? record.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0;
    return sum + itemsQuantity;
  }, 0);
  const totalValue = sortedAndFilteredRecords.reduce((sum, record) => sum + record.totalPrice, 0);

  // Helper to render sort icon
  const renderSortIcon = (columnKey: SortConfig['key']) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400 dark:text-gray-500" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-1 h-3 w-3 text-indigo-600 dark:text-indigo-400" />;
    }
    return <ArrowDown className="ml-1 h-3 w-3 text-indigo-600 dark:text-indigo-400" />;
  };

  // Функции для НОВОГО модального окна "Детализация позиций"
  const handleOpenItemDetailsModal = (record: AssemblyRecord) => {
    setSelectedRecordForDetails(record);
    setIsItemDetailsModalOpen(true);
  };

  const handleCloseItemDetailsModal = () => {
    setIsItemDetailsModalOpen(false);
    // setSelectedRecordForDetails(null); // Сбрасываем здесь или в useEffect, чтобы не было "прыжка" данных
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Учёт сборки</h1>
          <p className="text-gray-500 dark:text-gray-400">Отслеживание мебели, собранной вашей командой</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить запись
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-0">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="pl-10 block w-full border border-gray-300 dark:border-dark-border rounded-md shadow-sm 
                           focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 
                           text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-text 
                           placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Поиск (сотрудник, заметки, дата, мебель)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button 
                variant="secondary" 
                className="flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-1 h-4 w-4" />
                Фильтры
              </Button>
              {(filters.employeeId || filters.locationId || filters.dateFrom || filters.dateTo || searchTerm) && (
                <Button 
                  variant="info" 
                  size="sm"
                  onClick={resetFilters}
                >
                  Сбросить все
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Сотрудник"
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
              />
              <Select
                label="Объект"
                name="locationId"
                value={filters.locationId}
                onChange={handleFilterChange}
                options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
              />
              <Input
                label="Дата с"
                name="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
              <Input
                label="Дата по"
                name="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-dark-border flex flex-wrap gap-4">
          <div className="px-4 py-2 bg-white dark:bg-dark-card rounded-md shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Записи</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-dark-text">{sortedAndFilteredRecords.length}</p>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-dark-card rounded-md shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Собрано единиц</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-dark-text">{totalItems}</p>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-dark-card rounded-md shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Общая стоимость</p>
            <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">{totalValue.toFixed(2)} ₽</p>
          </div>
        </div>

        {/* Records Table */}
        {sortedAndFilteredRecords.length === 0 ? (
          <div className="text-center py-12 px-6">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-dark-text">Записи о сборке отсутствуют</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Пока нет ни одной записи или они не соответствуют фильтрам. Начните с добавления новой записи или измените фильтры.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => handleOpenModal()}
                className="flex items-center mx-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Добавить запись о сборке
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('date')}
                  >
                    <div className="flex items-center">
                      Дата {renderSortIcon('date')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('employeeName')}
                  >
                    <div className="flex items-center">
                      Сотрудник {renderSortIcon('employeeName')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('locationName')}
                  >
                    <div className="flex items-center">
                      Объект {renderSortIcon('locationName')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Мебель (клик для деталей)
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('totalQuantity')}
                  >
                     <div className="flex items-center">
                      Кол-во {renderSortIcon('totalQuantity')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('totalPrice')}
                  >
                    <div className="flex items-center">
                      Стоимость {renderSortIcon('totalPrice')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {sortedAndFilteredRecords.map((record: AssemblyRecord) => {
                  const employee = employees.find(emp => emp.id === record.employeeId);
                  const location = locations.find(loc => loc.id === record.locationId);
                  
                  const furnitureDisplay = record.items && record.items.length > 0 
                    ? record.items.map((item) => `${item.name} (x${item.quantity})`).join(', ') 
                    : (record.notes || 'N/A'); 
                  
                  const totalQuantityDisplay = record.items && record.items.length > 0
                    ? record.items.reduce((sum, item) => sum + item.quantity, 0)
                    : 0; 

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(parseISO(record.date), 'dd.MM.yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                        {employee?.name || 'Неизвестно'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {location?.name || 'Не указано'}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150"
                        onClick={() => handleOpenItemDetailsModal(record)}
                        title="Нажмите для просмотра деталей позиций"
                      >
                        {furnitureDisplay} 
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {totalQuantityDisplay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700 dark:text-indigo-400">
                        {record.totalPrice.toFixed(2)} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal(record)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation(record.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Record Modal */}
      {isModalActuallyVisible && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${backdropAnimationClass}`}
          onClick={handleCloseModal} // Закрытие по клику на фон
        >
          <div 
            className={`bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 space-y-6 transform transition-all duration-300 ease-in-out w-full max-w-3xl ${modalAnimationClass} overflow-y-auto max-h-[90vh] pb-20 sm:pb-6`} // Изменено max-w-2xl на max-w-4xl
            onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие по клику внутри модалки
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                {isEditing ? 'Редактировать запись' : 'Добавить новую запись'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4"> {/* Удален класс p-6, добавлены внутренние отступы space-y-4 если нужно */} 
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Сотрудник"
                    name="employeeId"
                    value={currentRecord.employeeId}
                    onChange={handleInputChange}
                    options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                    required
                    fullWidth
                  />
                  <Select
                    label="Объект"
                    name="locationId"
                    value={currentRecord.locationId}
                    onChange={handleInputChange}
                    options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
                    required
                    fullWidth
                  />
                </div>
                <Input
                  label="Дата"
                  name="date"
                  type="date"
                  value={currentRecord.date}
                  onChange={handleInputChange}
                  required
                  fullWidth
                />
              </div>

              <div className="mb-2">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Собранная мебель</h4>
              </div>

              {/* Контейнер для скролла позиций мебели */}
              <div className="max-h-[250px] overflow-y-auto pr-2 mb-4 space-y-4"> 
                {/* Строки с мебелью */}
                {furnitureEntries.map((entry, index) => (
                  <div key={entry.id} className="p-3 border border-gray-200 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Позиция {index + 1}</span>
                      {furnitureEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFurnitureEntry(entry.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Название мебели"
                        placeholder="Шкаф, стол, стул и т.д."
                        value={entry.name}
                        onChange={(e) => handleFurnitureEntryChange(entry.id, 'name', e.target.value)}
                        required
                      />
                      <Input
                        label="Количество"
                        type="number"
                        min="1"
                        value={entry.quantity}
                        onChange={(e) => handleFurnitureEntryChange(entry.id, 'quantity', e.target.value)}
                        required
                      />
                      <Input
                        label="Цена за единицу (₽)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.price}
                        onChange={(e) => handleFurnitureEntryChange(entry.id, 'price', e.target.value)}
                        required
                      />
                    </div>
                    <div className="mt-2 text-right text-sm font-medium text-indigo-700 dark:text-indigo-400">
                      Итого с учетом вычета {taxRate}%: {((entry.quantity * entry.price) - (entry.quantity * entry.price * taxRate / 100)).toFixed(2)} ₽
                    </div>
                  </div>
                ))}
              </div> {/* Закрываем контейнер для скролла */}

              <Button
                type="button"
                variant="secondary"
                onClick={addFurnitureEntry}
                className="w-full mb-4"
              >
                <Plus className="mr-1 h-4 w-4" />
                Добавить ещё мебель
              </Button>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Примечания (необязательно)
                </label>
                <textarea
                  name="notes"
                  value={currentRecord.notes || ''}
                  onChange={handleInputChange}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-text 
                             placeholder-gray-400 dark:placeholder-gray-500 
                             focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm"
                  placeholder="Дополнительная информация..."
                />
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
                  {isEditing ? 'Обновить' : 'Добавить'} запись
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* НОВОЕ Модальное окно "Детализация позиций" */}
      {isItemDetailsModalActuallyVisible && selectedRecordForDetails && (
        <div 
          className={[
            "fixed inset-0 flex items-center justify-center z-[60] p-4", // z-index выше, чем у основного модального (z-50)
            "transition-opacity duration-300 ease-in-out",
            itemDetailsBackdropAnimationClass
          ].join(' ')}
          onClick={handleCloseItemDetailsModal}
        >
          <div 
            className={[
              "bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl", // max-w-2xl, можно настроить
              "transition-all duration-300 ease-in-out",
              itemDetailsModalAnimationClass
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b px-6 py-4 dark:border-dark-border">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">
                Детализация сборки от {format(parseISO(selectedRecordForDetails.date), 'dd.MM.yyyy')}
              </h3>
              <button
                onClick={handleCloseItemDetailsModal}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto"> {/* Добавлен max-h и overflow-y */}
              {selectedRecordForDetails.items.length > 0 ? (
                <ul className="space-y-3">
                  {selectedRecordForDetails.items.map((item, index) => (
                    <li key={item.id || index} className="p-3 border border-gray-200 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700">
                      <h4 className="font-semibold text-md text-indigo-700 dark:text-indigo-400 mb-1">{item.name}</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Количество:</span>
                        <span className="font-medium text-gray-800 dark:text-dark-text">{item.quantity}</span>
                        
                        <span className="text-gray-600 dark:text-gray-300">Цена за ед. (до вычета):</span>
                        <span className="font-medium text-gray-800 dark:text-dark-text">{item.price.toFixed(2)} ₽</span>
                        
                        <span className="text-gray-600 dark:text-gray-300">Цена за ед. (с вычетом {taxRate}%):</span>
                        <span className="font-medium text-gray-800 dark:text-dark-text">{item.priceWithTax.toFixed(2)} ₽</span>
                        
                        <span className="text-gray-600 dark:text-gray-300">Итого по позиции (с вычетом):</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-300">{item.totalItemPriceWithTax.toFixed(2)} ₽</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет позиций для отображения.</p>
              )}
            </div>
             <div className="px-6 py-4 border-t dark:border-dark-border flex justify-end">
                <Button variant="secondary" onClick={handleCloseItemDetailsModal}>Закрыть</Button>
            </div>
          </div>
        </div>
      )}

      {/* Кастомный диалог подтверждения */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">Подтвердите действие</h3>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">{confirmDialogMessage}</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={handleCancelDelete}
              >
                Отмена
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Кастомный диалог оповещения */}
      {isAlertDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">Внимание</h3>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">{alertDialogMessage}</p>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAlertDialogOpen(false)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssemblyRecords;
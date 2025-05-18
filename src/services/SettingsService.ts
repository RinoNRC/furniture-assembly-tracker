// Ключи для локального хранилища
const APP_SETTINGS_KEY = 'furniture-tracker-app-settings';

// Типы настроек
export interface AppSettings {
  companyName: string;
  taxRate: number;
  defaultCurrency: string;
  language: string;
  notifyOnLowStock: boolean;
}

// Настройки по умолчанию
const defaultAppSettings: AppSettings = {
  companyName: 'ООО "Мебельная компания"',
  taxRate: 20,
  defaultCurrency: 'RUB',
  language: 'ru',
  notifyOnLowStock: true,
};

// Функции для работы с настройками приложения
export const getAppSettings = (): AppSettings => {
  const storedSettings = localStorage.getItem(APP_SETTINGS_KEY);
  return storedSettings ? JSON.parse(storedSettings) : defaultAppSettings;
};

export const saveAppSettings = (settings: AppSettings): void => {
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
};

// Функции для экспорта данных
export const exportToCSV = (data: any[], fileName: string): void => {
  // Преобразуем данные в формат CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','), // Заголовки
    ...data.map(row => headers.map(header => row[header]).join(',')) // Строки данных
  ].join('\n');
  
  // Создаем ссылку для скачивания
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Функция для создания резервной копии всех данных
export const createBackup = (): string => {
  const backup = {
    appSettings: getAppSettings(),
    employees: localStorage.getItem('furniture-tracker-employees'),
    assemblyRecords: localStorage.getItem('furniture-tracker-records'),
    salaryCalculations: localStorage.getItem('furniture-tracker-salaries'),
    auth: localStorage.getItem('furniture-tracker-auth'),
    timestamp: new Date().toISOString()
  };
  
  // Преобразуем в JSON и создаем строку для скачивания
  const jsonData = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const fileName = `furnitrack-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return fileName;
};

// Функция для восстановления из резервной копии
export const restoreFromBackup = (backupData: string): boolean => {
  try {
    const backup = JSON.parse(backupData);
    
    // Восстанавливаем данные
    if (backup.appSettings) {
      saveAppSettings(backup.appSettings);
    }
    
    if (backup.employees) {
      localStorage.setItem('furniture-tracker-employees', backup.employees);
    }
    
    if (backup.assemblyRecords) {
      localStorage.setItem('furniture-tracker-records', backup.assemblyRecords);
    }
    
    if (backup.salaryCalculations) {
      localStorage.setItem('furniture-tracker-salaries', backup.salaryCalculations);
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка восстановления из резервной копии:', error);
    return false;
  }
};

// Функции для работы с экспортом данных
export const getAssemblyRecordsForExport = (dateRange: string): any[] => {
  const records = JSON.parse(localStorage.getItem('furniture-tracker-records') || '[]');
  const employees = JSON.parse(localStorage.getItem('furniture-tracker-employees') || '[]');
  
  // Определяем диапазон дат
  const now = new Date();
  let startDate = new Date();
  
  if (dateRange === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (dateRange === 'quarter') {
    startDate.setMonth(now.getMonth() - 3);
  } else if (dateRange === 'year') {
    startDate.setFullYear(now.getFullYear() - 1);
  }
  
  // Фильтруем записи по дате
  const filteredRecords = records.filter((record: any) => 
    new Date(record.date) >= startDate && new Date(record.date) <= now
  );
  
  // Подготавливаем данные для экспорта
  return filteredRecords.map((record: any) => {
    const employee = employees.find((emp: any) => emp.id === record.employeeId);
    return {
      Дата: new Date(record.date).toLocaleDateString(),
      Сотрудник: employee?.name || 'Неизвестно',
      Мебель: record.notes,
      Количество: record.quantity,
      Стоимость: `${record.totalPrice.toFixed(2)} ₽`
    };
  });
}; 
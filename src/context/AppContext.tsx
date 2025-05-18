import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, FurnitureItem, AssemblyRecord, SalaryCalculation, Location } from '../types';
import { v4 as uuidv4 } from 'uuid';
import * as ApiService from '../services/ApiService';
import toast from 'react-hot-toast';

interface AppContextType {
  employees: Employee[];
  furnitureItems: FurnitureItem[];
  assemblyRecords: AssemblyRecord[];
  salaryCalculations: SalaryCalculation[];
  locations: Location[];
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addFurnitureItem: (item: Omit<FurnitureItem, 'id'>) => void;
  updateFurnitureItem: (item: FurnitureItem) => void;
  deleteFurnitureItem: (id: string) => void;
  addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  addAssemblyRecord: (record: Omit<AssemblyRecord, 'id'>) => Promise<void>;
  addMultipleAssemblyRecords: (records: Omit<AssemblyRecord, 'id'>[]) => Promise<void>;
  updateAssemblyRecord: (idToUpdate: string, newRecordData: Omit<AssemblyRecord, 'id'>) => Promise<boolean>;
  deleteAssemblyRecord: (id: string) => Promise<void>;
  calculateSalary: (employeeId: string, period: string) => number;
  getEmployeeAssemblyRecords: (employeeId: string) => AssemblyRecord[];
  getTotalAssembledByEmployee: (employeeId: string) => number;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  currentUser: { name: string; email: string } | null;
  updateCurrentUser: (userData: { name: string; email: string; password?: string }) => void;
  isLoading: boolean;
  theme: string; // 'light' or 'dark'
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage keys
const FURNITURE_ITEMS_KEY = 'furniture-tracker-items';
const SALARY_CALCULATIONS_KEY = 'furniture-tracker-salaries';
const AUTH_KEY = 'furniture-tracker-auth';
const THEME_KEY = 'furniture-tracker-theme'; // Ключ для темы

// Тестовый пользователь-администратор
const DEFAULT_ADMIN_USER = {
  email: 'admin@furnitrack.com',
  password: 'admin123',
  name: 'Администратор'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>(() => {
    const storedData = localStorage.getItem(FURNITURE_ITEMS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  });

  const [assemblyRecords, setAssemblyRecords] = useState<AssemblyRecord[]>([]);
  const [salaryCalculations, setSalaryCalculations] = useState<SalaryCalculation[]>(() => {
    const storedData = localStorage.getItem(SALARY_CALCULATIONS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  });
  
  const [locations, setLocations] = useState<Location[]>([]);

  // Состояние загрузки и ошибок
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Сохраняем данные пользователя
  const [adminUser, setAdminUser] = useState(() => {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      const { adminData } = JSON.parse(authData);
      return adminData || DEFAULT_ADMIN_USER;
    }
    return DEFAULT_ADMIN_USER;
  });

  // Состояние аутентификации
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const authData = localStorage.getItem(AUTH_KEY);
    return authData ? JSON.parse(authData).isLoggedIn : false;
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const authData = localStorage.getItem(AUTH_KEY);
    return authData ? JSON.parse(authData).user : null;
  });

  // Состояние для темы
  const [theme, setTheme] = useState<string>(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    // Проверяем, есть ли сохраненная тема, и соответствует ли она системным настройкам, если нет
    if (storedTheme) {
      return storedTheme;
    }
    // По умолчанию используем светлую тему, если не определено в localStorage или системных настройках
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Эффект для применения класса темы и сохранения в localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Функция для переключения темы
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Загрузка данных из API при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const toastId = toast.loading('Загрузка основных данных...');
      try {
        const [empData, recordsData, locationsData] = await Promise.all([
          ApiService.fetchEmployees(),
          ApiService.fetchAssemblyRecords(),
          ApiService.fetchLocations()
        ]);
        
        setEmployees(empData);
        setAssemblyRecords(recordsData);
        setLocations(locationsData);
        toast.dismiss(toastId); // Убираем уведомление после успешной загрузки
      } catch (err) {
        toast.error('Ошибка при загрузке основных данных', { id: toastId });
        console.error("Fetch Data Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(FURNITURE_ITEMS_KEY, JSON.stringify(furnitureItems));
  }, [furnitureItems]);

  useEffect(() => {
    localStorage.setItem(SALARY_CALCULATIONS_KEY, JSON.stringify(salaryCalculations));
  }, [salaryCalculations]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn, user: currentUser, adminData: adminUser }));
  }, [isLoggedIn, currentUser, adminUser]);

  // Employee operations
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    setIsLoading(true);
    const toastId = toast.loading('Добавление сотрудника...');
    try {
      const response = await ApiService.addEmployee(employee);
      if (response.data) {
        setEmployees([...employees, response.data]);
        toast.success('Сотрудник успешно добавлен!', { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось добавить сотрудника. Ответ от сервера не содержит данных или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось добавить сотрудника. Попробуйте снова.', { id: toastId });
      console.error("Add Employee Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployee = async (employee: Employee) => {
    setIsLoading(true);
    const toastId = toast.loading('Обновление данных сотрудника...');
    try {
      const response = await ApiService.updateEmployee(employee);
      if (response.data) {
        setEmployees(employees.map(emp => emp.id === employee.id ? response.data! : emp));
        toast.success('Данные сотрудника обновлены!', { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось обновить данные сотрудника. Ответ от сервера не содержит данных или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось обновить данные сотрудника. Попробуйте снова.', { id: toastId });
      console.error("Update Employee Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmployee = async (id: string) => {
    setIsLoading(true);
    const toastId = toast.loading('Удаление сотрудника...');
    try {
      const response = await ApiService.deleteEmployee(id);
      if (response.message) {
        setEmployees(employees.filter(emp => emp.id !== id));
        toast.success(response.message, { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось удалить сотрудника. Ответ от сервера не содержит сообщения или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось удалить сотрудника. Попробуйте снова.', { id: toastId });
      console.error("Delete Employee Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Location operations
  const addLocation = async (location: Omit<Location, 'id'>) => {
    setIsLoading(true);
    const toastId = toast.loading('Добавление объекта...');
    try {
      const response = await ApiService.addLocation(location);
      if (response.data) {
        setLocations([...locations, response.data]);
        toast.success('Объект успешно добавлен!', { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось добавить объект. Ответ от сервера не содержит данных или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось добавить объект. Попробуйте снова.', { id: toastId });
      console.error("Add Location Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async (location: Location) => {
    setIsLoading(true);
    const toastId = toast.loading('Обновление данных объекта...');
    try {
      const response = await ApiService.updateLocation(location);
      if (response.data) {
        setLocations(locations.map(loc => loc.id === location.id ? response.data! : loc));
        toast.success('Данные объекта обновлены!', { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось обновить данные объекта. Ответ от сервера не содержит данных или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось обновить данные объекта. Попробуйте снова.', { id: toastId });
      console.error("Update Location Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    setIsLoading(true);
    const toastId = toast.loading('Удаление объекта...');
    try {
      const response = await ApiService.deleteLocation(id);
      if (response.message) {
        setLocations(locations.filter(loc => loc.id !== id));
        toast.success(response.message, { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось удалить объект. Ответ от сервера не содержит сообщения или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось удалить объект. Попробуйте снова.', { id: toastId });
      console.error("Delete Location Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Furniture operations
  const addFurnitureItem = (item: Omit<FurnitureItem, 'id'>) => {
    const newItem = { ...item, id: uuidv4() };
    setFurnitureItems([...furnitureItems, newItem]);
  };

  const updateFurnitureItem = (item: FurnitureItem) => {
    setFurnitureItems(furnitureItems.map(fItem => fItem.id === item.id ? item : fItem));
  };

  const deleteFurnitureItem = (id: string) => {
    setFurnitureItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Assembly record operations
  const addAssemblyRecord = async (recordData: Omit<AssemblyRecord, 'id'>) => {
    setIsLoading(true);
    const toastId = toast.loading('Добавление записи о сборке...');
    try {
      const response = await ApiService.addAssemblyRecord(recordData);
      if (response.data) {
        const newRecord: AssemblyRecord = response.data;
        setAssemblyRecords(prevRecords => {
          const updatedRecords = [...prevRecords, newRecord];
          return updatedRecords;
        });
        toast.success('Запись о сборке добавлена!', { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось добавить запись о сборке. Ответ от сервера не содержит данных или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось добавить запись о сборке. Попробуйте снова.', { id: toastId });
      console.error("Add Assembly Record Error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addMultipleAssemblyRecords = async (records: Omit<AssemblyRecord, 'id'>[]) => {
    setIsLoading(true);
    const toastId = toast.loading('Добавление нескольких записей о сборке...');
    try {
      const response = await ApiService.addMultipleAssemblyRecords(records);
      if (response.data && Array.isArray(response.data)) {
        const newRecords: AssemblyRecord[] = response.data;
        setAssemblyRecords(prevRecords => {
          const updatedRecords = [...prevRecords, ...newRecords];
          return updatedRecords;
        });
        toast.success(`Успешно добавлено ${newRecords.length} записей!`, { id: toastId });
      } else if (response.error) {
        toast.error(`Ошибка: ${response.error}`, { id: toastId });
      } else {
        toast.error('Не удалось добавить несколько записей. Ответ от сервера не содержит данных или ошибки.', { id: toastId });
      }
    } catch (err) {
      toast.error('Не удалось добавить несколько записей. Попробуйте снова.', { id: toastId });
      console.error("Add Multiple Assembly Records Error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновленная функция для изменения существующей записи о сборке
  const updateAssemblyRecord = async (idToUpdate: string, newRecordData: Omit<AssemblyRecord, 'id'>): Promise<boolean> => {
    setIsLoading(true);
    const toastId = toast.loading('Обновление записи о сборке...');
    try {
      const response = await ApiService.updateAssemblyRecord(idToUpdate, newRecordData); 
      
      if (response.data) {
        setAssemblyRecords(prevRecords => 
          prevRecords.map(rec => rec.id === idToUpdate ? response.data! : rec)
        );
        toast.success('Запись о сборке обновлена!', { id: toastId });
        return true;
      } else {
        const errorMessage = response.error || 'Обновление не удалось: ошибка при обновлении записи на сервере.';
        toast.error(errorMessage, { id: toastId });
        return false;
      }
    } catch (err) {
      toast.error('Непредвиденная ошибка при обновлении записи о сборке. Попробуйте снова.', { id: toastId });
      console.error("Update Assembly Record Error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для прямого удаления записи (например, по кнопке "удалить")
  const deleteAssemblyRecord = async (id: string): Promise<void> => {
    setIsLoading(true);
    const toastId = toast.loading('Удаление записи о сборке...');
    try {
      const response = await ApiService.deleteAssemblyRecord(id);
      if(response.message) {
        setAssemblyRecords(prevRecords => prevRecords.filter(rec => rec.id !== id));
        toast.success(response.message, { id: toastId });
      } else {
        const errorMessage = response.error || 'Не удалось удалить запись о сборке.';
        toast.error(errorMessage, { id: toastId });
      }
    } catch (err) {
      toast.error('Непредвиденная ошибка при удалении записи о сборке. Попробуйте снова.', { id: toastId });
      console.error("Delete Assembly Record Error:", err);
    } finally {
        setIsLoading(false);
    }
  };

  // Salary calculation
  const calculateSalary = (employeeId: string, period: string) => {
    const employeeRecords = assemblyRecords.filter(record => record.employeeId === employeeId);
    const totalEarnings = employeeRecords.reduce((sum, record) => sum + record.totalPrice, 0);
    
    // Check if a salary calculation for this period already exists
    const existingCalculation = salaryCalculations.find(
      calc => calc.employeeId === employeeId && calc.period === period
    );

    if (existingCalculation) {
      const updatedCalculation = {
        ...existingCalculation,
        assemblyRecords: employeeRecords.map(record => record.id),
        totalEarnings
      };
      
      setSalaryCalculations(
        salaryCalculations.map(calc => 
          calc.id === existingCalculation.id ? updatedCalculation : calc
        )
      );
    } else {
      const newCalculation: SalaryCalculation = {
        id: uuidv4(),
        employeeId,
        period,
        assemblyRecords: employeeRecords.map(record => record.id),
        totalEarnings,
        isPaid: false
      };
      
      setSalaryCalculations([...salaryCalculations, newCalculation]);
    }

    return totalEarnings;
  };

  // Helper functions
  const getEmployeeAssemblyRecords = (employeeId: string) => {
    return assemblyRecords.filter(record => record.employeeId === employeeId);
  };

  const getTotalAssembledByEmployee = (employeeId: string) => {
    return assemblyRecords
      .filter(record => record.employeeId === employeeId)
      .reduce((total, record) => {
        const itemsQuantity = record.items.reduce((sum, item) => sum + item.quantity, 0);
        return total + itemsQuantity;
      }, 0);
  };

  // Функция обновления данных пользователя
  const updateCurrentUser = (userData: { name: string; email: string; password?: string }) => {
    // Обновляем текущего пользователя
    if (currentUser) {
      const updatedUser = {
        name: userData.name,
        email: userData.email
      };
      setCurrentUser(updatedUser);
      
      // Обновляем данные администратора, если обновляется его профиль
      if (userData.email === adminUser.email) {
        const updatedAdmin = {
          ...adminUser,
          name: userData.name,
          email: userData.email
        };
        
        // Обновляем пароль, если он указан
        if (userData.password) {
          updatedAdmin.password = userData.password;
        }
        
        setAdminUser(updatedAdmin);
      }
    }
  };

  // Функции аутентификации
  const login = (email: string, password: string) => {
    // В реальном приложении здесь должна быть проверка через API
    if (email === adminUser.email && password === adminUser.password) {
      setIsLoggedIn(true);
      setCurrentUser({
        name: adminUser.name,
        email: adminUser.email
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Можно сбросить тему к системной при выходе или оставить как есть
    // const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    // setTheme(systemTheme); 
  };

  const value = {
    employees,
    furnitureItems,
    assemblyRecords,
    salaryCalculations,
    locations,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addFurnitureItem,
    updateFurnitureItem,
    deleteFurnitureItem,
    addLocation,
    updateLocation,
    deleteLocation,
    addAssemblyRecord,
    addMultipleAssemblyRecords,
    updateAssemblyRecord,
    deleteAssemblyRecord,
    calculateSalary,
    getEmployeeAssemblyRecords,
    getTotalAssembledByEmployee,
    isLoggedIn,
    login,
    logout,
    currentUser,
    updateCurrentUser,
    isLoading,
    theme,
    toggleTheme
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
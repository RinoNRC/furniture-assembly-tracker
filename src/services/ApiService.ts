import { Employee, AssemblyRecord, Location } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Использовать относительный путь к API
const API_URL = '/api';

// Интерфейс для ответа API
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Функции для работы с сотрудниками
export const fetchEmployees = async (): Promise<Employee[]> => {
  // console.log('[ApiService] Fetching employees from /api/employees'); 
  const response = await fetch('/api/employees');
  // console.log('[ApiService] fetchEmployees response status:', response.status);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении списка сотрудников');
  }
  const data = await response.json();
  // console.log('Получены данные:', data);
  return data;
};

export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<ApiResponse<Employee>> => {
  const newEmployee = { ...employee, id: uuidv4() };
  
  // console.log('Добавление сотрудника (ApiService):', newEmployee);
  try {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEmployee),
    });
    
    // console.log('Ответ от сервера:', response.status);
    
    if (!response.ok) {
      throw new Error('Ошибка при добавлении сотрудника');
    }
    
    return { data: newEmployee, message: 'Сотрудник успешно добавлен' };
  } catch (error) {
    // console.error('Ошибка при добавлении сотрудника:', error);
    return { error: (error as Error).message };
  }
};

export const updateEmployee = async (employee: Employee): Promise<ApiResponse<Employee>> => {
  try {
    const response = await fetch(`${API_URL}/employees/${employee.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при обновлении сотрудника');
    }
    
    return { data: employee, message: 'Данные сотрудника обновлены' };
  } catch (error) {
    console.error('Ошибка при обновлении сотрудника:', error);
    return { error: (error as Error).message };
  }
};

export const deleteEmployee = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при удалении сотрудника');
    }
    
    return { message: 'Сотрудник удален' };
  } catch (error) {
    console.error('Ошибка при удалении сотрудника:', error);
    return { error: (error as Error).message };
  }
};

// Функции для работы с объектами (локациями)
export const fetchLocations = async (): Promise<Location[]> => {
  try {
    // console.log('Запрос объектов');
    const response = await fetch(`${API_URL}/locations`);
    // console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      throw new Error('Ошибка при получении списка объектов');
    }
    const data = await response.json();
    // console.log('Получены данные:', data);
    return data;
  } catch (error) {
    // console.error('Ошибка при получении объектов:', error);
    return [];
  }
};

export const addLocation = async (location: Omit<Location, 'id'>): Promise<ApiResponse<Location>> => {
  const newLocation = { ...location, id: uuidv4() };
  
  // console.log('Добавление объекта (ApiService):', newLocation);
  try {
    const response = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLocation),
    });
    
    // console.log('Ответ от сервера:', response.status);
    
    if (!response.ok) {
      throw new Error('Ошибка при добавлении объекта');
    }
    
    return { data: newLocation, message: 'Объект успешно добавлен' };
  } catch (error) {
    // console.error('Ошибка при добавлении объекта:', error);
    return { error: (error as Error).message };
  }
};

export const updateLocation = async (location: Location): Promise<ApiResponse<Location>> => {
  try {
    const response = await fetch(`${API_URL}/locations/${location.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при обновлении объекта');
    }
    
    return { data: location, message: 'Данные объекта обновлены' };
  } catch (error) {
    console.error('Ошибка при обновлении объекта:', error);
    return { error: (error as Error).message };
  }
};

export const deleteLocation = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при удалении объекта');
    }
    
    return { message: 'Объект удален' };
  } catch (error) {
    console.error('Ошибка при удалении объекта:', error);
    return { error: (error as Error).message };
  }
};

// Функции для работы с записями о сборке
export const fetchAssemblyRecords = async (): Promise<AssemblyRecord[]> => {
  try {
    const response = await fetch(`${API_URL}/assembly-records`);
    
    if (!response.ok) {
      throw new Error('Ошибка при получении записей о сборке');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении записей о сборке:', error);
    return [];
  }
};

export const addAssemblyRecord = async (record: Omit<AssemblyRecord, 'id'>): Promise<ApiResponse<AssemblyRecord>> => {
  const newRecord = { ...record, id: uuidv4() };
  
  try {
    const response = await fetch(`${API_URL}/assembly-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRecord),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при добавлении записи о сборке');
    }
    
    return { data: newRecord, message: 'Запись о сборке добавлена' };
  } catch (error) {
    console.error('Ошибка при добавлении записи о сборке:', error);
    return { error: (error as Error).message };
  }
};

export const addMultipleAssemblyRecords = async (records: Omit<AssemblyRecord, 'id'>[]): Promise<ApiResponse<AssemblyRecord[]>> => {
  try {
    const newRecords = records.map(record => ({
      ...record,
      id: uuidv4()
    }));
    
    // Обрабатываем каждую запись по отдельности
    const promises = newRecords.map(record => 
      fetch(`${API_URL}/assembly-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      })
    );
    
    const responses = await Promise.all(promises);
    
    // Проверяем, что все запросы выполнены успешно
    if (responses.some(response => !response.ok)) {
      throw new Error('Ошибка при добавлении записей о сборке');
    }
    
    return { data: newRecords, message: `Добавлено ${newRecords.length} записей` };
  } catch (error) {
    console.error('Ошибка при добавлении записей о сборке:', error);
    return { error: (error as Error).message };
  }
};

export const deleteAssemblyRecord = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_URL}/assembly-records/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при удалении записи о сборке');
    }
    
    return { message: 'Запись о сборке удалена' };
  } catch (error) {
    console.error('Ошибка при удалении записи о сборке:', error);
    return { error: (error as Error).message };
  }
};

// Обновление существующей записи о сборке
export const updateAssemblyRecord = async (id: string, recordData: Omit<AssemblyRecord, 'id'>): Promise<{ data?: AssemblyRecord; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/assembly-records/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });
    if (!response.ok) {
      const errorResult = await response.json();
      return { error: errorResult.error || `Ошибка ${response.status} от сервера` };
    }
    const data: AssemblyRecord = await response.json();
    return { data };
  } catch (error) {
    console.error('ApiService.updateAssemblyRecord error:', error);
    return { error: 'Сетевая ошибка или ошибка при обновлении записи о сборке' };
  }
};
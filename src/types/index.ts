export interface Employee {
  id: string;
  name: string;
  position: string;
  hourlyRate?: number;
  joinDate: string;
  contactNumber?: string;
  rate: number;
  hireDate: string;
  contactInfo: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  contactPerson?: string;
  contactInfo?: string;
  notes?: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  description?: string;
}

// Определение элемента в записи о сборке
export interface AssemblyRecordItem {
  id: string; // ID элемента формы, или ID из базы данных, если элементы хранятся отдельно
  name: string;
  quantity: number;
  price: number; // Цена за единицу ДО налога
  priceWithTax: number; // Цена за единицу ПОСЛЕ налога
  totalItemPriceWithTax: number; // Общая цена для этой позиции ПОСЛЕ налога (quantity * priceWithTax)
}

export interface AssemblyRecord {
  id: string;
  employeeId: string;
  locationId?: string;
  items: AssemblyRecordItem[]; // Новое поле для списка позиций
  date: string;
  totalPrice: number; // Общая стоимость всех items
  notes?: string;
}

export interface SalaryCalculation {
  id: string;
  employeeId: string;
  period: string;
  assemblyRecords: string[]; // IDs of assembly records
  totalEarnings: number;
  isPaid: boolean;
  paymentDate?: string;
}
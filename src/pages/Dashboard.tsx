import React from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import { Wrench, User, DollarSign, TrendingUp, BarChart2, Users, PackageSearch, ListX, Activity } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
// Импорт только для побочных эффектов (регистрации компонентов)
import 'chart.js/auto';
import { format, parseISO, isSameMonth, compareDesc } from 'date-fns';

const Dashboard: React.FC = () => {
  const { 
    employees, 
    assemblyRecords,
    getEmployeeAssemblyRecords,
    theme
  } = useAppContext();

  // Calculate total assembled furniture
  const totalAssembled = (assemblyRecords && Array.isArray(assemblyRecords)) ? assemblyRecords.reduce(
    (sum, record) => sum + (record.items && Array.isArray(record.items) ? record.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) : 0),
    0
  ) : 0;

  // Calculate total earnings
  const totalEarnings = (assemblyRecords && Array.isArray(assemblyRecords)) ? assemblyRecords.reduce(
    (sum, record) => sum + (record.totalPrice || 0), 
    0
  ) : 0;

  // Prepare data for employee performance chart
  const employeeData = (employees && Array.isArray(employees) && assemblyRecords && Array.isArray(assemblyRecords)) ? employees.map(employee => {
    const records = getEmployeeAssemblyRecords(employee.id);
    
    const totalItems = (records && Array.isArray(records)) ? records.reduce((sum, record) => sum + (record.items && Array.isArray(record.items) ? record.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) : 0), 0) : 0;
    const totalValue = (records && Array.isArray(records)) ? records.reduce((sum, record) => sum + (record.totalPrice || 0), 0) : 0;
    
    return {
      name: employee.name,
      itemsAssembled: totalItems,
      totalValue
    };
  }) : [];

  // Sort employees by most productive
  const topPerformers = [...employeeData]
    .sort((a, b) => b.itemsAssembled - a.itemsAssembled)
    .slice(0, 5);

  const barChartData = {
    labels: topPerformers.map(emp => emp.name),
    datasets: [
      {
        label: 'Items Assembled',
        data: topPerformers.map(emp => emp.itemsAssembled),
        backgroundColor: theme === 'dark' ? 'rgba(129, 140, 248, 0.6)' : 'rgba(99, 102, 241, 0.6)',
        borderColor: theme === 'dark' ? 'rgb(101, 116, 205)' : 'rgb(79, 70, 229)',
        borderWidth: 1,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#e2e8f0' : '#4b5563',
        }
      },
      title: {
        display: true,
        text: 'Лучшие сотрудники',
        color: theme === 'dark' ? '#e2e8f0' : '#374151',
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#cbd5e1' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(74, 85, 104, 0.4)' : 'rgba(209, 213, 219, 0.4)',
        }
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#cbd5e1' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(74, 85, 104, 0.4)' : 'rgba(209, 213, 219, 0.4)',
        }
      }
    }
  };

  // Соберем информацию о самой популярной мебели из items
  const furnitureFrequency: Record<string, number> = {};
  
  if (assemblyRecords && Array.isArray(assemblyRecords)) {
    assemblyRecords.forEach(record => {
      if (record.items && Array.isArray(record.items)) {
        record.items.forEach(item => {
          furnitureFrequency[item.name] = (furnitureFrequency[item.name] || 0) + (item.quantity || 0);
        });
      }
    });
  }
  
  const topFurniture = Object.entries(furnitureFrequency)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- Calculate records this month ---
  const calculateRecordsThisMonth = () => {
    if (!assemblyRecords || !Array.isArray(assemblyRecords)) {
      return 0;
    }
    const currentDate = new Date();

    return assemblyRecords.filter(record => {
      return isSameMonth(parseISO(record.date), currentDate);
    }).length;
  };
  const recordsThisMonth = calculateRecordsThisMonth();
  // --- End Calculate records this month ---

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Панель управления</h1>
          <p className="text-gray-500 dark:text-gray-400">Обзор операций по сборке мебели</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-l-4 border-indigo-500 dark:border-indigo-400">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 mr-4">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Сотрудники</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">{(employees && Array.isArray(employees)) ? employees.length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="border-l-4 border-blue-500 dark:border-blue-400">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 mr-4">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Собрано</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">{totalAssembled}</p>
            </div>
          </div>
        </Card>
        
        <Card className="border-l-4 border-yellow-500 dark:border-yellow-400">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 mr-4">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Общая стоимость</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">{totalEarnings.toFixed(2)} ₽</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Производительность сотрудников">
          {topPerformers.length > 0 ? (
            <div className="h-96">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          ) : (
            <div className="text-center py-12 px-6 h-96 flex flex-col justify-center items-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-dark-text">Нет данных</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Нет данных о производительности сотрудников для отображения.
              </p>
            </div>
          )}
        </Card>

        <Card title="Самая популярная мебель">
          {topFurniture.length > 0 ? (
            <div className="space-y-3 py-2">
              {topFurniture.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow bg-gray-200 dark:bg-gray-700 rounded-full h-5 mr-3">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-5 rounded-full text-xs text-white flex items-center justify-end pr-2"
                      style={{ 
                        width: `${Math.max(10, (item.count / Math.max(1,topFurniture[0].count)) * 100)}%`
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                  <div className="min-w-[100px] text-right">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 min-h-[200px] flex flex-col justify-center items-center">
              <PackageSearch className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-dark-text">Нет данных</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Нет данных о собранной мебели для отображения популярности.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Последние записи о сборке">
        {(assemblyRecords && Array.isArray(assemblyRecords) && assemblyRecords.length > 0) ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Мебель (Предметы)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Кол-во (Общее)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Стоимость
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {assemblyRecords
                  .sort((a,b) => compareDesc(parseISO(a.date), parseISO(b.date)))
                  .slice(0, 5)
                  .map((record) => {
                    const employee = (employees && Array.isArray(employees)) ? employees.find(emp => emp.id === record.employeeId) : undefined;
                    const itemsDisplay = (record.items && Array.isArray(record.items)) ? record.items.map(i => `${i.name} (x${i.quantity || 0})`).join(', ') : '';
                    const totalQuantity = (record.items && Array.isArray(record.items)) ? record.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0;
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(parseISO(record.date), 'dd.MM.yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                          {employee?.name || 'Неизвестно'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {itemsDisplay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                          {totalQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {record.totalPrice?.toFixed(2) || 'N/A'} ₽
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <ListX className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-dark-text">Нет записей</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              За последнее время не было добавлено ни одной записи о сборке.
            </p>
          </div>
        )}
      </Card>
      
      {/* Performance Trends */}
      <Card title="Тенденции эффективности">
        {(assemblyRecords && Array.isArray(assemblyRecords) && assemblyRecords.length > 0 && employees && Array.isArray(employees) && employees.length > 0) ? (
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 flex-1">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 mr-4">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Средняя производительность</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                  {(totalAssembled / employees.length).toFixed(1)} ед./сотрудник
                </p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 flex-1">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 mr-4">
                <BarChart2 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Записей в этом месяце</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                  {recordsThisMonth}
                </p> 
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-6 min-h-[150px] flex flex-col justify-center items-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-dark-text">Нет данных</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Недостаточно данных для отображения тенденций эффективности.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
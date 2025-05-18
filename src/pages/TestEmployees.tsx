import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const TestEmployees: React.FC = () => {
  console.log('[TestEmployees Component] Function body executing');
  const { theme } = useAppContext();

  useEffect(() => {
    console.log('[TestEmployees Page] Current theme on mount/update:', theme);
  }, [theme]);

  return (
    <div>
      <h1>Тестовая страница сотрудников</h1>
      <p>Текущая тема: {theme}</p>
      <p>Если вы видите это сообщение и логи в консоли, значит, компонент рендерится и получает тему из контекста.</p>
    </div>
  );
};

export default TestEmployees; 
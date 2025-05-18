import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import AssemblyRecords from '../pages/AssemblyRecords';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import LocationManagement from '../pages/LocationManagement';

// Компонент защищенного маршрута
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn } = useAppContext();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Компонент маршрутизации
const AppRoutes: React.FC = () => {
  const { isLoggedIn } = useAppContext();
  
  return (
    <Routes>
      {/* Публичный маршрут для логина */}
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} 
      />
      
      {/* Защищенные маршруты в общем лейауте */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employees" 
        element={
          <ProtectedRoute>
            <Layout>
              <Employees />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/locations" 
        element={
          <ProtectedRoute>
            <Layout>
              <LocationManagement />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/assembly-records" 
        element={
          <ProtectedRoute>
            <Layout>
              <AssemblyRecords />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Перенаправление для не найденных маршрутов */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
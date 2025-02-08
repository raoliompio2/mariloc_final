import React, { useEffect } from 'react';
import { Routes as ReactRoutes, Route, useLocation } from 'react-router-dom';
import { ProductCatalog } from './pages/ProductCatalog';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { ClientDashboard } from './pages/ClientDashboard';
import { LandlordDashboard } from './pages/LandlordDashboard';
import { Settings } from './pages/Settings';
import { MachineRegister } from './pages/MachineRegister';
import { MachineEdit } from './pages/MachineEdit';
import { MachineList } from './pages/MachineList';
import { CategoryList } from './pages/CategoryList';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetail } from './pages/ProductDetail';
import { QuoteRequest } from './pages/QuoteRequest';
import { AccessoryList } from './pages/AccessoryList';
import { AccessoryRegister } from './pages/AccessoryRegister';
import { AccessoryEdit } from './pages/AccessoryEdit';
import { Profile } from './pages/Profile';
import { QuoteList } from './pages/QuoteList';
import { ClientQuotes } from './pages/ClientQuotes';
import { RentalList } from './pages/RentalList';
import { ClientRentals } from './pages/ClientRentals';
import { RentalDetails } from './pages/RentalDetails';
import { RentalReturn } from './pages/RentalReturn';
import { CompletedReturns } from './pages/CompletedReturns';
import { ClientReturns } from './pages/ClientReturns';
import { NotFound } from './pages/NotFound';
import { TestSettings } from './pages/TestSettings';
import { useLoading } from './contexts/LoadingContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function Routes() {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading();
    // Simula o tempo de carregamento da página
    const timer = setTimeout(() => {
      stopLoading();
    }, 800); // 0.8 segundos

    return () => clearTimeout(timer);
  }, [location.pathname, startLoading, stopLoading]);

  return (
    <ReactRoutes>
      <Route element={<MainLayout />}>
        {/* Rotas Públicas */}
        <Route path="/" element={<ProductCatalog />} />
        <Route path="/catalogo-de-produtos/:categorySlug" element={<CategoryPage />} />
        <Route path="/catalogo-de-produtos/produto/:slug" element={<ProductDetail />} />
        <Route path="/quote/request/:slug" element={<QuoteRequest />} />
        
        {/* Rotas de Cliente */}
        <Route path="/client/dashboard" element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client/quotes" element={
          <ProtectedRoute requiredRole="client">
            <ClientQuotes />
          </ProtectedRoute>
        } />
        <Route path="/client/rentals" element={
          <ProtectedRoute requiredRole="client">
            <ClientRentals />
          </ProtectedRoute>
        } />
        <Route path="/client/returns" element={
          <ProtectedRoute requiredRole="client">
            <ClientReturns />
          </ProtectedRoute>
        } />

        {/* Rotas de Proprietário */}
        <Route path="/landlord/dashboard" element={
          <ProtectedRoute requiredRole="landlord">
            <LandlordDashboard />
          </ProtectedRoute>
        } />
        <Route path="/machine/register" element={
          <ProtectedRoute requiredRole="landlord">
            <MachineRegister />
          </ProtectedRoute>
        } />
        <Route path="/machine/edit/:id" element={
          <ProtectedRoute requiredRole="landlord">
            <MachineEdit />
          </ProtectedRoute>
        } />
        <Route path="/machine/list" element={
          <ProtectedRoute requiredRole="landlord">
            <MachineList />
          </ProtectedRoute>
        } />
        <Route path="/category/list" element={
          <ProtectedRoute requiredRole="landlord">
            <CategoryList />
          </ProtectedRoute>
        } />
        <Route path="/accessory/list" element={
          <ProtectedRoute requiredRole="landlord">
            <AccessoryList />
          </ProtectedRoute>
        } />
        <Route path="/accessory/register" element={
          <ProtectedRoute requiredRole="landlord">
            <AccessoryRegister />
          </ProtectedRoute>
        } />
        <Route path="/accessory/edit/:id" element={
          <ProtectedRoute requiredRole="landlord">
            <AccessoryEdit />
          </ProtectedRoute>
        } />
        <Route path="/quote/list" element={
          <ProtectedRoute requiredRole="landlord">
            <QuoteList />
          </ProtectedRoute>
        } />
        <Route path="/rental/list" element={
          <ProtectedRoute requiredRole="landlord">
            <RentalList />
          </ProtectedRoute>
        } />
        <Route path="/rental/:id" element={
          <ProtectedRoute requiredRole="landlord">
            <RentalDetails />
          </ProtectedRoute>
        } />
        <Route path="/rental/return/:id" element={
          <ProtectedRoute requiredRole="landlord">
            <RentalReturn />
          </ProtectedRoute>
        } />
        <Route path="/completed/returns" element={
          <ProtectedRoute requiredRole="landlord">
            <CompletedReturns />
          </ProtectedRoute>
        } />

        {/* Rotas que precisam apenas de autenticação */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/test/settings" element={<TestSettings />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </ReactRoutes>
  );
}

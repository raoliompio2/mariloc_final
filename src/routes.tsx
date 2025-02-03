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
import { LandlordQuotes } from './pages/LandlordQuotes';
import { useLoading } from './contexts/LoadingContext';

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
      <Route path="/" element={<ProductCatalog />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/client-dashboard" element={<ClientDashboard />} />
      <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/machine/register" element={<MachineRegister />} />
      <Route path="/machine/edit/:id" element={<MachineEdit />} />
      <Route path="/machines" element={<MachineList />} />
      <Route path="/categories" element={<CategoryList />} />
      <Route path="/quotes" element={<QuoteList />} />
      <Route path="/catalogo-de-produtos/:categorySlug" element={<CategoryPage />} />
      <Route path="/catalogo-de-produtos/produto/:slug" element={<ProductDetail />} />
      <Route path="/catalogo-de-produtos/produto/:slug/orcamento" element={<QuoteRequest />} />
      <Route path="/accessories" element={<AccessoryList />} />
      <Route path="/accessory/register" element={<AccessoryRegister />} />
      <Route path="/accessory/edit/:id" element={<AccessoryEdit />} />
      <Route path="/test-settings" element={<TestSettings />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/client/quotes" element={<ClientQuotes />} />
      <Route path="/rentals" element={<RentalList />} />
      <Route path="/client/rentals" element={<ClientRentals />} />
      <Route path="/rentals/:id/details" element={<RentalDetails />} />
      <Route path="/rentals/:id/returns" element={<RentalReturn />} />
      <Route path="/returns/completed" element={<CompletedReturns />} />
      <Route path="/client/returns" element={<ClientReturns />} />
    </ReactRoutes>
  );
}

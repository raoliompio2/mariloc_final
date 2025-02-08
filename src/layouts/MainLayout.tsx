import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

/**
 * Home.tsx
 * Página inicial com busca inteligente de produtos.
 */

import React from 'react';
import { Navbar } from '../components/Navbar';
import { HomeHero } from '../components/home/HomeHero';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <HomeHero />
      </main>
    </div>
  );
}
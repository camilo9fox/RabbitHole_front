"use client";

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { ProductDataProvider } from '@/context/ProductDataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductDataProvider>
          {children}
        </ProductDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

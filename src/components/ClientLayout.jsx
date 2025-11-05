// src/components/ClientLayout.jsx
'use client';

import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

export function ClientLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingBottom: '80px' }}>{children}</main>
      <BottomNav />
    </>
  );
}
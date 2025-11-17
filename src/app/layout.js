// src/app/layout.js
// 'use client'; // ← Add this if using any client-side code

import { Navbar } from '@/components/Navbar';
import { ClientLayout } from '@/components/ClientLayout';
import Script from 'next/script'; // ← THIS IS MISSING
import './globals.css';

export const metadata = {
  title: 'WEMSTY',
  description: 'What Ever Makes Sense To You',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* PAYSTACK SCRIPT */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />

        <Navbar />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
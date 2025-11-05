// src/app/layout.js
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'WEMSTY',
  description: 'What Ever Makes Sense To You',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
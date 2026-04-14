import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'e-Pharma | Pharmacy Management System',
  description: 'Complete pharmacy management system for managing medicines, sales, and inventory.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', fontSize: '14px' },
            success: { style: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' } },
            error: { style: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' } },
          }}
        />
      </body>
    </html>
  );
}

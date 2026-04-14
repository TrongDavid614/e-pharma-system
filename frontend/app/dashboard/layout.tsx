'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUser, removeToken } from '@/lib/auth';
import { User } from '@/types';
import NotificationPanel from '@/components/NotificationPanel';
import {
  HomeIcon,
  BeakerIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/dashboard/medicines', label: 'Medicines', icon: BeakerIcon },
  { href: '/dashboard/pos', label: 'Point of Sale', icon: ShoppingCartIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(getUser());
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.replace('/login');
  };

  if (!user) return null;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full ${
        mobile ? '' : 'w-64 bg-gray-900 text-white'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <BeakerIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-base leading-tight">e-Pharma</p>
          <p className="text-xs text-gray-400 leading-tight">Pharmacy System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-3 pb-4 border-t border-gray-700 pt-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-800">
          <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 font-medium">
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-red-900/40 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-64 h-full bg-gray-900 text-white shadow-xl">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-base font-semibold text-gray-800">
              {navLinks.find((l) =>
                l.href === '/dashboard' ? pathname === l.href : pathname.startsWith(l.href)
              )?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  BeakerIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalMedicines: number;
  lowStockCount: number;
  todaySalesCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [medicinesRes, salesRes] = await Promise.all([
        api.get<{ content?: unknown[]; length?: number } | unknown[]>('/medicines'),
        api.get<unknown[]>('/sales'),
      ]);

      const medicines = Array.isArray(medicinesRes.data)
        ? medicinesRes.data
        : (medicinesRes.data as { content?: unknown[] }).content ?? [];

      type MedicineItem = { quantity: number; lowStockThreshold: number };
      const lowStock = (medicines as MedicineItem[]).filter(
        (m) => m.quantity <= m.lowStockThreshold
      ).length;

      const allSales = Array.isArray(salesRes.data) ? salesRes.data : [];
      const today = new Date().toISOString().split('T')[0];
      type SaleItem = { saleDate: string };
      const todaySales = (allSales as SaleItem[]).filter((s) =>
        s.saleDate?.startsWith(today)
      ).length;

      setStats({
        totalMedicines: (medicines as unknown[]).length,
        lowStockCount: lowStock,
        todaySalesCount: todaySales,
      });
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = stats
    ? [
        {
          label: 'Total Medicines',
          value: stats.totalMedicines,
          icon: BeakerIcon,
          color: 'blue',
          bg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          border: 'border-blue-100',
        },
        {
          label: 'Low Stock Alerts',
          value: stats.lowStockCount,
          icon: ExclamationTriangleIcon,
          color: stats.lowStockCount > 0 ? 'red' : 'green',
          bg: stats.lowStockCount > 0 ? 'bg-red-50' : 'bg-green-50',
          iconColor: stats.lowStockCount > 0 ? 'text-red-500' : 'text-green-500',
          border: stats.lowStockCount > 0 ? 'border-red-100' : 'border-green-100',
        },
        {
          label: "Today's Sales",
          value: stats.todaySalesCount,
          icon: ShoppingBagIcon,
          color: 'purple',
          bg: 'bg-purple-50',
          iconColor: 'text-purple-600',
          border: 'border-purple-100',
        },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your pharmacy</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {cards.map(({ label, value, icon: Icon, bg, iconColor, border }) => (
              <div
                key={label}
                className={`${bg} ${border} border rounded-2xl p-6 flex items-center gap-4 shadow-sm`}
              >
                <div className={`h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {stats && stats.lowStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-red-800">Stock Alert</h3>
              </div>
              <p className="text-sm text-red-700">
                {stats.lowStockCount} medicine{stats.lowStockCount !== 1 ? 's are' : ' is'} at or
                below the low stock threshold. Please restock soon.
              </p>
              <a
                href="/dashboard/medicines"
                className="inline-block mt-3 text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
              >
                View medicines →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

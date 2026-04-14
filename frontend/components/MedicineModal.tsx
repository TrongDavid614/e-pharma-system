'use client';

import React, { useEffect, useState } from 'react';
import { Medicine } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MedicineModalProps {
  open: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onSubmit: (data: Omit<Medicine, 'id'>) => Promise<void>;
}

const EMPTY_FORM = {
  name: '',
  batchId: '',
  expiryDate: '',
  unit: 'PILL' as 'PILL' | 'BOTTLE',
  quantity: 0,
  price: 0,
  lowStockThreshold: 10,
};

export default function MedicineModal({ open, medicine, onClose, onSubmit }: MedicineModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM | 'general', string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicine) {
      setForm({
        name: medicine.name,
        batchId: medicine.batchId,
        expiryDate: medicine.expiryDate,
        unit: medicine.unit,
        quantity: medicine.quantity,
        price: medicine.price,
        lowStockThreshold: medicine.lowStockThreshold,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [medicine, open]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof typeof EMPTY_FORM | 'general', string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.batchId.trim()) e.batchId = 'Batch ID is required';
    if (!form.expiryDate) e.expiryDate = 'Expiry date is required';
    if (form.quantity < 0) e.quantity = 'Quantity must be non-negative';
    if (form.price <= 0) e.price = 'Price must be positive';
    if (form.lowStockThreshold < 0) e.lowStockThreshold = 'Threshold must be non-negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-lg font-semibold text-white">
            {medicine ? 'Edit Medicine' : 'Add Medicine'}
          </h2>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-blue-500 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {errors.general && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. Paracetamol 500mg"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.batchId ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. BATCH-001"
              />
              {errors.batchId && <p className="text-xs text-red-500 mt-1">{errors.batchId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiryDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as 'PILL' | 'BOTTLE' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PILL">Pill</option>
                <option value="BOTTLE">Bottle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min={0}
                value={form.lowStockThreshold}
                onChange={(e) =>
                  setForm({ ...form, lowStockThreshold: Number(e.target.value) })
                }
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lowStockThreshold ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.lowStockThreshold && (
                <p className="text-xs text-red-500 mt-1">{errors.lowStockThreshold}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {medicine ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

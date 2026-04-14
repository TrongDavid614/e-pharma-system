'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Medicine } from '@/types';
import MedicineModal from '@/components/MedicineModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Medicine[] | { content: Medicine[] }>('/medicines');
      const data = Array.isArray(res.data) ? res.data : res.data.content ?? [];
      setMedicines(data);
      setFiltered(data);
    } catch {
      toast.error('Failed to load medicines.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.batchId.toLowerCase().includes(q)
      )
    );
  }, [search, medicines]);

  const handleAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditTarget(medicine);
    setModalOpen(true);
  };

  const handleSubmit = async (data: Omit<Medicine, 'id'>) => {
    if (editTarget) {
      await api.put(`/medicines/${editTarget.id}`, data);
      toast.success('Medicine updated successfully.');
    } else {
      await api.post('/medicines', data);
      toast.success('Medicine added successfully.');
    }
    await fetchMedicines();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/medicines/${deleteTarget.id}`);
      toast.success(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
      await fetchMedicines();
    } catch {
      toast.error('Failed to delete medicine.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isLowStock = (m: Medicine) => m.quantity <= m.lowStockThreshold;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicines</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} in inventory
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or batch ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
          <p className="text-lg font-medium">No medicines found</p>
          <p className="text-sm mt-1">
            {search ? 'Try a different search term.' : 'Add your first medicine to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Batch ID', 'Expiry Date', 'Unit', 'Qty', 'Price', 'Threshold', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => (
                  <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${isLowStock(m) ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {m.name}
                        {isLowStock(m) && (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{m.batchId}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(m.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                        {m.unit}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${isLowStock(m) ? 'text-red-600' : 'text-gray-800'}`}>
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-700">${m.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{m.lowStockThreshold}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MedicineModal
        open={modalOpen}
        medicine={editTarget}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Medicine"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
}

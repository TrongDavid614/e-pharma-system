'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Medicine, SaleItem } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

interface SaleResponse {
  id: number;
  saleDate: string;
  totalAmount: number;
  items: Array<{
    medicine: { id: number; name: string };
    quantity: number;
    unitPrice: number;
  }>;
}

export default function POSPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SaleResponse | null>(null);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Medicine[] | { content: Medicine[] }>('/medicines');
      const data = Array.isArray(res.data) ? res.data : res.data.content ?? [];
      setMedicines(data);
    } catch {
      toast.error('Failed to load medicines.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.batchId.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (medicine: Medicine) => {
    if (medicine.quantity === 0) {
      toast.error(`${medicine.name} is out of stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.medicine.id === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.quantity) {
          toast.error(`Only ${medicine.quantity} units available.`);
          return prev;
        }
        return prev.map((c) =>
          c.medicine.id === medicine.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.medicine.id !== id) return c;
          const newQty = c.quantity + delta;
          if (newQty > c.medicine.quantity) {
            toast.error(`Only ${c.medicine.quantity} units available.`);
            return c;
          }
          return { ...c, quantity: newQty };
        })
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.medicine.id !== id));
  };

  const total = cart.reduce((sum, c) => sum + c.medicine.price * c.quantity, 0);

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const items: SaleItem[] = cart.map((c) => ({
        medicineId: c.medicine.id,
        quantity: c.quantity,
      }));
      const res = await api.post<SaleResponse>('/sales', { items });
      setReceipt(res.data);
      setCart([]);
      await fetchMedicines();
      toast.success('Sale completed!');
    } catch {
      toast.error('Failed to process sale. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Point of Sale</h2>
        <p className="text-sm text-gray-500 mt-0.5">Search medicines and build a sale</p>
      </div>

      {/* Success receipt overlay */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="text-center mb-5">
              <CheckCircleIcon className="h-14 w-14 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900">Sale Completed!</h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(receipt.saleDate).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 divide-y divide-gray-200">
              <div className="pb-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                {receipt.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">
                      {item.medicine.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-blue-600 text-lg">
                  ${receipt.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setReceipt(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              New Sale
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search - Left */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines by name or batch ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No medicines found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filtered.map((m) => {
                  const inCart = cart.find((c) => c.medicine.id === m.id)?.quantity ?? 0;
                  const outOfStock = m.quantity === 0;
                  return (
                    <button
                      key={m.id}
                      onClick={() => addToCart(m)}
                      disabled={outOfStock}
                      className={`text-left border rounded-xl p-3 transition-all ${
                        outOfStock
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                          : inCart > 0
                          ? 'border-blue-400 bg-blue-50 hover:border-blue-500'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{m.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{m.batchId}</p>
                        </div>
                        {inCart > 0 && (
                          <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {inCart}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-blue-700">
                          ${m.price.toFixed(2)}
                          <span className="text-xs font-normal text-gray-500 ml-1">/{m.unit.toLowerCase()}</span>
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            outOfStock
                              ? 'bg-red-100 text-red-600'
                              : m.quantity <= m.lowStockThreshold
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {outOfStock ? 'Out of stock' : `${m.quantity} left`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart - Right */}
        <div className="flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
              <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Cart</h3>
              {cart.length > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-96">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <ShoppingCartIcon className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">Cart is empty</p>
                  <p className="text-xs mt-1">Click medicines to add them</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.medicine.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.medicine.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.medicine.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.medicine.id)}
                        className="text-red-400 hover:text-red-600 p-0.5 flex-shrink-0"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.medicine.id, -1)}
                          className="h-7 w-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <MinusIcon className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.medicine.id, 1)}
                          className="h-7 w-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <PlusIcon className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">
                        ${(item.medicine.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total & Checkout */}
            <div className="border-t border-gray-200 px-4 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="flex items-center gap-1.5 w-full justify-center py-2 text-xs text-gray-500 hover:text-red-600 border border-dashed border-gray-300 rounded-xl transition-colors"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Clear cart
                </button>
              )}
              <button
                onClick={completeSale}
                disabled={cart.length === 0 || submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Complete Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

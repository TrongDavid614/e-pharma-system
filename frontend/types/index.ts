export interface Medicine {
  id: number;
  name: string;
  batchId: string;
  expiryDate: string;
  unit: 'PILL' | 'BOTTLE';
  quantity: number;
  price: number;
  lowStockThreshold: number;
}

export interface SaleItem {
  medicineId: number;
  quantity: number;
}

export interface Sale {
  id: number;
  saleDate: string;
  totalAmount: number;
  items: Array<{ medicine: { id: number; name: string }; quantity: number; unitPrice: number }>;
}

export interface User {
  username: string;
  role: 'ADMIN' | 'PHARMACIST';
}

export interface Notification {
  type: 'LOW_STOCK' | 'EXPIRING_SOON';
  medicineId: number;
  medicineName: string;
  message: string;
}

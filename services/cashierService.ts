import { Cashier, CashierResponse } from '@/types/api';
import apiClient from '@/utils/apiClient';

const cashierService = {
  createCashier: async (data: Cashier): Promise<CashierResponse> => {
    const response = await apiClient.post('/business/cashier', data);
    return response.data;
  },

  getAllCashiers: async (): Promise<CashierResponse[]> => {
    const response = await apiClient.get('/business/cashier');
    return response.data;
  },

  getCashierById: async (id: string): Promise<CashierResponse> => {
    const response = await apiClient.get(`/business/cashier/${id}`);
    return response.data;
  },

  updateCashier: async (id: string, data: Partial<Cashier>): Promise<CashierResponse> => {
    const response = await apiClient.put(`/business/cashier/${id}`, data);
    return response.data;
  },

  deleteCashier: async (id: string): Promise<void> => {
    await apiClient.delete(`/business/cashier/${id}`);
  }
};

export default cashierService;

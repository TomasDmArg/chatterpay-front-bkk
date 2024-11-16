import apiClient from '@/utils/apiClient';
import { CreateCashierDTO, CashierListData, SingleCashierData } from '@/types/api';

const cashierService = {
  createCashier: async (data: CreateCashierDTO): Promise<SingleCashierData> => {
    const response = await apiClient.post('/business/cashier', data);
    return response.data.data;
  },

  getAllCashiers: async (): Promise<CashierListData> => {
    const response = await apiClient.get('/business/cashier');
    return response.data.data;
  },

  getCashierById: async (id: string): Promise<SingleCashierData> => {
    const response = await apiClient.get(`/business/cashier/${id}`);
    return response.data.data;
  },

  updateCashier: async (id: string, data: Partial<CreateCashierDTO>): Promise<SingleCashierData> => {
    const response = await apiClient.put(`/business/cashier/${id}`, data);
    return response.data.data;
  },

  deleteCashier: async (id: string): Promise<void> => {
    await apiClient.delete(`/business/cashier/${id}`);
  }
};

export default cashierService;
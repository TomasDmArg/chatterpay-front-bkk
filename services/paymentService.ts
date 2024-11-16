import apiClient from '@/utils/apiClient';
import { CreatePaymentOrderDTO, PaymentOrderListData, SinglePaymentOrderData } from '@/types/api';

const paymentService = {
  createPaymentOrder: async (data: CreatePaymentOrderDTO): Promise<SinglePaymentOrderData> => {
    const response = await apiClient.post('/business/payment', data);
    return response.data;
  },

  getAllPaymentOrders: async (): Promise<PaymentOrderListData> => {
    const response = await apiClient.get('/business/payment');
    return response.data;
  },

  getPaymentOrderById: async (id: string): Promise<SinglePaymentOrderData> => {
    const response = await apiClient.get(`/business/payment/${id}`);
    return response.data;
  },

  updatePaymentOrder: async (id: string, data: Partial<CreatePaymentOrderDTO>): Promise<SinglePaymentOrderData> => {
    const response = await apiClient.put(`/business/payment/${id}`, data);
    return response.data;
  },

  deletePaymentOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/business/payment/${id}`);
  }
};

export default paymentService;
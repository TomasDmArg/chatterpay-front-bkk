import apiClient from '@/utils/apiClient';
import { Business, BusinessResponse } from '@/types/api';

const businessService = {
  createBusiness: async (data: Business): Promise<BusinessResponse> => {
    const response = await apiClient.post('/business', data);
    return response.data;
  },

  getAllBusinesses: async (): Promise<BusinessResponse[]> => {
    const response = await apiClient.get('/business');
    return response.data;
  },

  getBusinessById: async (id: string): Promise<BusinessResponse> => {
    const response = await apiClient.get(`/business/${id}`);
    return response.data;
  },

  updateBusiness: async (id: string, data: Partial<Business>): Promise<BusinessResponse> => {
    const response = await apiClient.put(`/business/${id}`, data);
    return response.data;
  },

  deleteBusiness: async (id: string): Promise<void> => {
    await apiClient.delete(`/business/${id}`);
  }
};

export default businessService;

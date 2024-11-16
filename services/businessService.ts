import apiClient from '@/utils/apiClient';
import { CreateBusinessDTO, BusinessListData, SingleBusinessData } from '@/types/api';

const businessService = {
  createBusiness: async (data: CreateBusinessDTO): Promise<SingleBusinessData> => {
    const response = await apiClient.post('/business', data);
    return response.data;
  },

  getAllBusinesses: async (): Promise<BusinessListData> => {
    const response = await apiClient.get('/business');
    return response.data;
  },

  getBusinessById: async (id: string): Promise<SingleBusinessData> => {
    const response = await apiClient.get(`/business/${id}`);
    return response.data;
  },

  updateBusiness: async (id: string, data: Partial<CreateBusinessDTO>): Promise<SingleBusinessData> => {
    const response = await apiClient.put(`/business/${id}`, data);
    return response.data;
  },

  deleteBusiness: async (id: string): Promise<void> => {
    await apiClient.delete(`/business/${id}`);
  }
};

export default businessService;
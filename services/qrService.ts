import apiClient from "@/utils/apiClient";

const qrService = {
  getPublicQRInfo: async (qrCode: string): Promise<any> => {
    const response = await apiClient.get(`/qr/${qrCode}`);
    return response.data;
  }
};

export default qrService;

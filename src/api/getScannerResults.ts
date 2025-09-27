import axios from 'axios';

import { GetScannerResultParams, ScannerApiResponse } from "../types";
const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api-rs.dexcelerate.com'

export const getScannerResults = async (params: GetScannerResultParams): Promise<ScannerApiResponse> => {
    try {
      const response = await axios.get<ScannerApiResponse>(`${baseUrl}/scanner`, {
        params
      });
      console.log(response.data, 'response data from scanner service');
      return response.data;
    } catch (error) {
      console.error('Error fetching scanner results:', error);
      throw error;
    }
  }
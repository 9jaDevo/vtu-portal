import { apiClient } from './apiClient';

interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  usage_limit?: number;
  usage_count: number;
  last_used?: string;
  status: 'active' | 'suspended' | 'revoked';
  created_at: string;
  updated_at: string;
}

interface CreateApiKeyRequest {
  name: string;
  permissions?: string[];
  usage_limit?: number;
}

interface CreateApiKeyResponse {
  message: string;
  apiKey: {
    id: string;
    name: string;
    key: string; // Plain text key - only returned once
    permissions: string[];
    usage_limit?: number;
    status: string;
    created_at: string;
  };
}

export const apiKeyService = {
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get('/keys');
    return response.data;
  },

  async generateApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post('/keys', data);
    return response.data;
  },

  async revokeApiKey(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/keys/${id}`);
    return response.data;
  },

  async updateApiKey(id: string, data: { name?: string; usage_limit?: number }): Promise<{ message: string }> {
    const response = await apiClient.patch(`/keys/${id}`, data);
    return response.data;
  }
};
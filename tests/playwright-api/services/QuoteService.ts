import { APIResponse } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { Service } from './Service';

export interface QuoteData {
  subject?: string;
  person_id?: number;
  items?: Array<{ product_id: number; quantity: number; price: number }>;
}

export class QuoteService extends Service {
  constructor(client: ApiClient) {
    super(client, '/api/v1/quotes');
  }

  async create(data: QuoteData, options?: any): Promise<APIResponse> {
    return this.client.post(this.basePath, { data, ...options });
  }

  async getItems(id: number | string): Promise<APIResponse> {
    return this.client.get(`/api/v1/quotes/${id}/items`);
  }

  async getLeadProducts(leadId: number | string): Promise<APIResponse> {
    return this.client.get(`/api/v1/quotes/lead-products/${leadId}`);
  }
  

  async sendMail(id: number | string, data: { to: string; subject: string; body: string }): Promise<APIResponse> {
    return this.client.post(`/api/v1/quotes/${id}/mail`, { data });
  }
}

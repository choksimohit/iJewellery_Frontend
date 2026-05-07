import client from './client'
import type { CustomerInfo } from '../types'

export interface CreateCustomerPayload {
  name: string
  address: string
  phone: string
}

export interface CreateCustomerResponse {
  customer_id: number
  name: string
  address: string
}

export const customersApi = {
  getByPhone: (phone: string) =>
    client.get<CustomerInfo>(`/customers/by-phone/${phone}`).then((r) => r.data),

  create: (data: CreateCustomerPayload) =>
    client.post<CreateCustomerResponse>('/customers/', data).then((r) => r.data),
}

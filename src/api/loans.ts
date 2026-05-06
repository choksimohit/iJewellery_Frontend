import client from './client'
import type { Loan, Lookups, LoanEntryRequest } from '../types'

export const loansApi = {
  search: (searchType: string, searchValue: string) =>
    client
      .post<Loan[]>('/loans/search', { search_type: searchType, search_value: searchValue })
      .then((r) => r.data),

  getLookups: () =>
    client.get<Lookups>('/loans/lookups').then((r) => r.data),

  create: (data: LoanEntryRequest) =>
    client
      .post<{ success: boolean; loan_number: number }>('/loans/entry', data)
      .then((r) => r.data),
}

export interface User {
  user_id: string
  display_name: string
}

export interface CustomerInfo {
  CustomerID: number
  Name: string
  Address: string
  ActiveLoanCount: number
  ClosedLoanCount: number
  AvgClosureDays: number
}

export interface Loan {
  LoanNumber: number
  LoanDate: string
  Name: string
  Address?: string
  Phone?: string
  LoanAmount: number
  SourceName?: string
  IsClosure: boolean
  MetalType?: string
  ItemDescription?: string
  MetalWeight?: number   // SP returns MetalWeight, not ItemWeight
  ItemWeight?: number    // alias kept for compatibility
  Melting?: number
}

export interface MetalRates {
  rate_date: string | null
  gold_rate: number | null
  silver_rate: number | null
}

export interface DashboardStats {
  metal_rates: MetalRates | null
  source_wise_amounts: Record<string, unknown>[]
  total_active_loans: number
  total_loan_amount: number
  today_loans: number
}

export interface ItemType {
  ItemTypeID: number
  ItemName: string
}

export interface MetalType {
  MetalTypeID: number
  MetalType: string
}

export interface LoanSource {
  SourceID: number
  SourceName: string
}

export interface Village {
  VillageID: number
  VillageName: string
}

export interface Lookups {
  item_types: ItemType[]
  metal_types: MetalType[]
  loan_sources: LoanSource[]
  villages: Village[]
}

export interface LoanItem {
  item_type_id: number
  metal_type: string
  item_description: string
  item_weight: number
  melting: number
}

export interface LoanEntryRequest {
  loan_number: number
  loan_date: string
  customer_id: number
  customer_name: string
  customer_address: string
  customer_phone: string
  loan_source_id: number
  loan_amount: number
  items: LoanItem[]
}

export interface Business {
  phoneNumber: string
  name: string
  photo?: string
  owner: string
  createdAt?: string
}

export interface BusinessResponse {
  status: string
  data: {
    message: string
    business: Business
  }
  timestamp: string
}

export interface Cashier {
  name: string
  uniqueId: string
  business: string
  active: boolean
  createdAt?: string
}

export interface CashierResponse {
  status: string
  data: {
    message: string
    cashier: Cashier
  }
  timestamp: string
}

export interface PaymentOrder {
  amount: number
  currency: string
  status: string
  network: string
  cashier: string
  createdAt?: string
}

export interface PaymentResponse {
  status: string
  data: {
    message: string
    order: PaymentOrder
  }
  timestamp: string
}

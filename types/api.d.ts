// Interfaces base
export interface Business {
  _id: string
  phoneNumber: string
  name: string
  photo?: string
  owner: string
  createdAt: string
  __v: number
}

export interface Cashier {
  _id: string
  name: string
  uniqueId: string
  business: string
  active: boolean
  createdAt: string
  __v: number
}

export interface PaymentOrder {
  _id: string
  amount: number
  currency: string
  status: string
  network: string
  cashier: Cashier
  createdAt: string
  __v: number
}

export interface QRCodePayment {
  amount: number
  currency: string
  createdAt: string
}

export interface QRCodeBusiness {
  name: string
  logo: string
}

// DTOs para crear/actualizar
export interface CreateBusinessDTO {
  phoneNumber: string
  name: string
  photo?: string
  owner: string
}

export interface CreateCashierDTO {
  name: string
  uniqueId: string
  business: string
  active: boolean
}

export interface CreatePaymentOrderDTO {
  amount: number
  currency: string
  network: string
  cashier: string
}

// Interfaces para response.data
export interface BusinessListData {
  message: string
  businesses: Business[]
}

export interface SingleBusinessData {
  message: string
  business: Business
}

export interface CashierListData {
  message: string
  cashiers: Cashier[]
}

export interface SingleCashierData {
  message: string
  cashier: Cashier
}

export interface PaymentOrderListData {
  message: string
  orders: PaymentOrder[]
}

export interface SinglePaymentOrderData {
  message: string
  order: PaymentOrder
}

export interface QRCodeData {
  message: string
  qrCodeId: string
  payURL: string
  payment: QRCodePayment
  business: QRCodeBusiness
}

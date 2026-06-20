export interface User {
  uid: string;
  email: string;
  companyName: string;
  createdAt: Date;
}

export interface Client {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  instagram?: string;
  email?: string;
  lastPurchase: Date;
  purchaseValue: number;
  service: string;
  createdAt: Date;
}

export interface Referral {
  id?: string;
  userId: string;
  referrerClientId: string;
  referrerName: string;
  referredName: string;
  referredPhone: string;
  converted: boolean;
  saleValue?: number;
  createdAt: Date;
}

export interface Campaign {
  id?: string;
  userId: string;
  title: string;
  message: string;
  sendAfterHours: number;
  isActive: boolean;
}

export interface AIMessage {
  text: string;
  imageURL?: string;
}
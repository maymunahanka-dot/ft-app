// lib/crm-types.ts

import { Timestamp } from "firebase/firestore";

export interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  level: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  totalSpent: number;
  lastActivity: Timestamp;
  birthday?: Timestamp;
  avatar?: string;
  tags?: string[];
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
  category: "discount" | "service" | "access" | "gift";
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  validUntil?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: "draft" | "scheduled" | "sent" | "archived";
  recipients: string[];
  recipientCount: number;
  sentAt?: Timestamp;
  scheduledAt?: Timestamp;
  openRate?: number;
  clickRate?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "push";
  content: string;
  lastUsed?: Timestamp;
  usageCount: number;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  comment: string;
  productName?: string;
  orderNumber?: string;
  invoiceNumber?: string;
  status: "pending" | "approved" | "hidden";
  isPublic: boolean;
  reply?: string;
  repliedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CRMStats {
  totalClients: number;
  monthlyGrowth: number;
  loyaltyMembers: number;
  loyaltyPercentage: number;
  totalCampaigns: number;
  lastCampaignDate?: Timestamp;
  averageRating: number;
  totalReviews: number;
}

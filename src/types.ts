/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum MemberStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Member {
  id: string;
  name: string;
  username: string;
  phone: string;
  address: string;
  familySize: number;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string;
  jabatan?: string;
}

export enum BillStatus {
  UNPAID = 'unpaid',
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid'
}

export interface Bill {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  paidAt?: string;
  paymentMethod?: string;
  paymentProof?: string; // Base64 or ref
  memberId: string;
  memberName: string;
}

export enum FinanceType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface FinancialRecord {
  id: string;
  type: FinanceType;
  category: string;
  amount: number;
  description: string;
  date: string;
  addedBy: string;
}

export interface DonationContribution {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  date: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'active' | 'completed';
  creator: string;
  createdAt: string;
  contributions: DonationContribution[];
}

export interface ForumComment {
  id: string;
  content: string;
  authorName: string;
  role: MemberRole;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  role: MemberRole;
  createdAt: string;
  comments: ForumComment[];
}

export interface ActivityNews {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  addedBy: string;
}

// Client State Auth Type
export interface AuthUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: MemberRole;
  status: MemberStatus;
}

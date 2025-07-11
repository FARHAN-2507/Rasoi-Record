export type WastageReason = 'Spoilage' | 'Preparation Waste' | 'Customer Leftover' | 'Expired' | 'Overproduction';
export const wastageReasons: WastageReason[] = ['Spoilage', 'Preparation Waste', 'Customer Leftover', 'Expired', 'Overproduction'];

export type WastageUnit = 'kg' | 'g' | 'L' | 'ml' | 'units';
export const wastageUnits: WastageUnit[] = ['kg', 'g', 'L', 'ml', 'units'];

export interface WastageEntry {
  id: string;
  item: string;
  quantity: number;
  unit: WastageUnit;
  reason: WastageReason;
  date: Date;
  userId: string;
  cost?: number;
}

export type UserRole = 'super_admin' | 'owner';

export interface AppUser {
  uid: string;
  email: string | null;
  role: UserRole;
  weeklyWasteGoal?: number;
}

export interface Donation extends WastageEntry {
  donor: AppUser;
}

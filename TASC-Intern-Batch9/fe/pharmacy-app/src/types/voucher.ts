export interface Voucher {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string;
  type: string;
  discountValue: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  usageLimit: number;
  usageLimitPerUser: number;
  collectedCount?: number;
  status: string;
  startDate: string;
  endDate: string;
  claimed: boolean;
  used?: boolean;
}

export interface UserVoucherRequest {
  voucherId: number;
}


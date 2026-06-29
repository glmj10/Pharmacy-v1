export interface Voucher {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string; // Enum từ backend
  type: string; // SHIPPING, ORDER...
  discountValue: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  usageLimit: number;
  usageLimitPerUser: number;
  collectedCount?: number; // Số lượng đã thu thập
  status: string;
  startDate: string;
  endDate: string;
  claimed: boolean;
  used?: boolean; // Voucher đã sử dụng hay chưa
}

export interface UserVoucherRequest {
  voucherId: number;
}
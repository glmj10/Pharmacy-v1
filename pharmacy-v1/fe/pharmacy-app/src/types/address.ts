// Backend gọi là Profile, nhưng ở Frontend ta gọi Address cho rõ nghĩa
export interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string; // Địa chỉ chi tiết
  isDefault: boolean;
}

// Request gửi lên khi tạo/sửa
export interface AddressRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
}
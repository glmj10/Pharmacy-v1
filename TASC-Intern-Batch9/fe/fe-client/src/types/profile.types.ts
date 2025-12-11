// ... (Các type cũ)

// Profile (Địa chỉ nhận hàng)
export interface Profile {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string;
}

// Request tạo/sửa
export interface ProfileRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
}
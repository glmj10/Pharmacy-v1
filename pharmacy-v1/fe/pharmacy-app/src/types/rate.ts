export interface UserResponse {
  id: number;
  username: string;
  profilePicUrl?: string; // Có thể null
}

export interface RateResponse {
  id: number;
  rating: number; // 1-5
  comment: string;
  userResponse: UserResponse; // Object lồng nhau
  createdAt?: string; // Thường backend sẽ trả về thêm ngày tạo
}

export interface RateRequest {
  rating: number; // 1-5
  orderDetailId: number;
  comment: string;
}
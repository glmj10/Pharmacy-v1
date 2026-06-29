export interface RateRequest {
  rating: number; // 1-5
  orderDetailId: number;
  comment: string;
}

// Response Đánh giá (Backend trả về)
export interface RateResponse {
  id: number;
  rating: number;
  comment: string;
  userResponse: {
    id: number;
    username: string;
    profilePicUrl: string;
  };
}
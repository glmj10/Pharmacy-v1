export type PromotionStatus = 'UPCOMING' | 'ONGOING' | 'CANCELLED' | 'ENDED'; // Enum giả định, bạn check lại backend trả về string gì

export interface Promotion {
  id: number;
  name: string;
  thumbnailUrl: string;
  startTime: string; 
  endTime: string;
  status: PromotionStatus;
}
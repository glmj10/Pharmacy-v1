export interface Banner {
  id: number;
  name: string;
  imageUrl: string; // Backend trả về URL hoặc UUID
  targetUrl: string;
  type: 'SLIDER' | 'SIDE' | 'FOOTER' | string; // Phân loại banner
  priority: number;
}
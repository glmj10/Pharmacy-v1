export interface Banner {
  id: number;
  name: string;
  imageUrl: string;
  targetUrl: string;
  type: 'SLIDER' | 'SIDE' | 'FOOTER' | string;
  priority: number;
}

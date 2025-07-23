export interface RouteData {
  startPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  endPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  waypoints: Array<{
    lat: number;
    lng: number;
    address: string;
  }>;
  route: Array<{
    lat: number;
    lng: number;
  }>;
  distance: number; // メートル
  duration: number; // 秒
  transportMode: 'walking' | 'cycling';
}

export interface RouteFormData {
  duration: number; // 分
  startAddress: string;
  transportMode: 'walking' | 'cycling';
} 
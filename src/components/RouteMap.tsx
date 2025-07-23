import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteData } from '../types';

interface RouteMapProps {
  routeData: RouteData;
}

const RouteMap: React.FC<RouteMapProps> = ({ routeData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 既存の地図インスタンスをクリア
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // 地図の初期化
    const map = L.map(mapRef.current).setView(
      [routeData.startPoint.lat, routeData.startPoint.lng], 
      13
    );

    // OpenStreetMapタイルレイヤーを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // 少し遅延させてからマーカーとルートを追加
    setTimeout(() => {
      if (!mapInstanceRef.current) return;

      // スタート地点のマーカー
      const startMarker = L.marker([routeData.startPoint.lat, routeData.startPoint.lng])
        .addTo(map)
        .bindPopup(`<b>スタート</b><br>${routeData.startPoint.address}`);

      // ゴール地点のマーカー
      const endMarker = L.marker([routeData.endPoint.lat, routeData.endPoint.lng])
        .addTo(map)
        .bindPopup(`<b>ゴール</b><br>${routeData.endPoint.address}`);

      // 経由地のマーカー
      routeData.waypoints.forEach((waypoint, index) => {
        L.marker([waypoint.lat, waypoint.lng])
          .addTo(map)
          .bindPopup(`<b>経由地 ${index + 1}</b><br>${waypoint.address}`);
      });

      // ルートの描画
      if (routeData.route.length > 0) {
        const routeLine = L.polyline(routeData.route.map(point => [point.lat, point.lng]), {
          color: routeData.transportMode === 'walking' ? '#3B82F6' : '#10B981',
          weight: 4,
          opacity: 0.8
        }).addTo(map);

        // ルートに沿って矢印を追加
        const arrowIcon = L.divIcon({
          className: 'route-arrow',
          html: routeData.transportMode === 'walking' ? '🚶' : '🚴',
          iconSize: [20, 20]
        });

        // ルートの中間点に矢印を配置
        const midPoint = Math.floor(routeData.route.length / 2);
        if (routeData.route[midPoint]) {
          L.marker([routeData.route[midPoint].lat, routeData.route[midPoint].lng], {
            icon: arrowIcon
          }).addTo(map);
        }

        // 地図の表示範囲を調整
        map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
      }

      // 地図のサイズを再計算
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeData]);

  return (
    <div className="space-y-4">
      <div className="bg-noble-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-noble-800 mb-2">
          ルート情報
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-noble-600">距離:</span>
            <span className="ml-2 font-medium">
              {(routeData.distance / 1000).toFixed(1)} km
            </span>
          </div>
          <div>
            <span className="text-noble-600">時間:</span>
            <span className="ml-2 font-medium">
              {Math.round(routeData.duration / 60)} 分
            </span>
          </div>
          <div>
            <span className="text-noble-600">移動手段:</span>
            <span className="ml-2 font-medium">
              {routeData.transportMode === 'walking' ? '🚶 徒歩' : '🚴 自転車'}
            </span>
          </div>
          <div>
            <span className="text-noble-600">経由地:</span>
            <span className="ml-2 font-medium">
              {routeData.waypoints.length} 箇所
            </span>
          </div>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="h-80 w-full rounded-lg border border-noble-200"
        style={{ minHeight: '320px' }}
      />
    </div>
  );
};

export default RouteMap; 
import { RouteFormData, RouteData } from '../types';

// API使用量を監視する関数
const checkApiUsage = (): boolean => {
  const today = new Date().toDateString();
  const usageKey = `google_maps_api_usage_${today}`;
  const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');
  
  // 1日あたり100回まで制限（無料枠の安全マージン）
  if (currentUsage >= 100) {
    console.warn('Daily API usage limit reached, using fallback');
    return false;
  }
  
  // 使用回数を更新
  localStorage.setItem(usageKey, (currentUsage + 1).toString());
  return true;
};

// Google Maps Geocoding APIを使用して住所を座標に変換する関数
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  // Google Maps APIキーを環境変数から取得
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (apiKey && checkApiUsage()) {
    try {
      // 使用量制限のための安全策
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ja&region=jp`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          // タイムアウト設定（5秒）
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (!response.ok) {
        console.warn(`Geocoding API HTTP error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log(`Geocoded address "${address}" to: ${location.lat}, ${location.lng}`);
        return {
          lat: location.lat,
          lng: location.lng
        };
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.warn('Google Maps API quota exceeded, using fallback');
        throw new Error('API使用量制限に達しました');
      } else if (data.status === 'REQUEST_DENIED') {
        console.warn('Google Maps API request denied, using fallback');
        throw new Error('APIリクエストが拒否されました');
      } else {
        console.warn(`Geocoding failed for "${address}": ${data.status}`);
        throw new Error(`住所の変換に失敗しました: ${data.status}`);
      }
    } catch (error) {
      console.error('Geocoding API error:', error);
      // APIエラーの場合はフォールバックを使用
    }
  }
  
  // フォールバック: 日本の主要都市の座標を使用（改善版）
  const fallbackCoordinates: { [key: string]: { lat: number; lng: number } } = {
    // 東京都
    '東京': { lat: 35.6762, lng: 139.6503 },
    '東京駅': { lat: 35.6812, lng: 139.7671 },
    '新宿': { lat: 35.6895, lng: 139.6917 },
    '新宿駅': { lat: 35.6895, lng: 139.7004 },
    '渋谷': { lat: 35.6580, lng: 139.7016 },
    '渋谷駅': { lat: 35.6580, lng: 139.7016 },
    '池袋': { lat: 35.7295, lng: 139.7109 },
    '池袋駅': { lat: 35.7295, lng: 139.7109 },
    '銀座': { lat: 35.6716, lng: 139.7639 },
    '原宿': { lat: 35.6702, lng: 139.7016 },
    '六本木': { lat: 35.6626, lng: 139.7310 },
    '秋葉原': { lat: 35.6985, lng: 139.7730 },
    '浅草': { lat: 35.7148, lng: 139.7967 },
    '上野': { lat: 35.7142, lng: 139.7744 },
    '品川': { lat: 35.6285, lng: 139.7388 },
    '品川駅': { lat: 35.6285, lng: 139.7388 },
    '目黒': { lat: 35.6333, lng: 139.7167 },
    '恵比寿': { lat: 35.6467, lng: 139.7100 },
    '中目黒': { lat: 35.6433, lng: 139.6983 },
    '代官山': { lat: 35.6483, lng: 139.7033 },
    '自由が丘': { lat: 35.6083, lng: 139.6683 },
    '三軒茶屋': { lat: 35.6433, lng: 139.6717 },
    '下北沢': { lat: 35.6617, lng: 139.6667 },
    '吉祥寺': { lat: 35.7033, lng: 139.5792 },
    '立川': { lat: 35.6983, lng: 139.4133 },
    '八王子': { lat: 35.6583, lng: 139.3233 },
    '町田': { lat: 35.5417, lng: 139.4467 },
    
    // 大阪府
    '大阪': { lat: 34.6937, lng: 135.5023 },
    '大阪駅': { lat: 34.7024, lng: 135.4959 },
    '梅田': { lat: 34.7024, lng: 135.4959 },
    '難波': { lat: 34.6683, lng: 135.5022 },
    '心斎橋': { lat: 34.6717, lng: 135.5017 },
    '天王寺': { lat: 34.6575, lng: 135.5033 },
    '新大阪': { lat: 34.7333, lng: 135.5000 },
    '京橋': { lat: 34.6967, lng: 135.5333 },
    '淀屋橋': { lat: 34.6917, lng: 135.5017 },
    '本町': { lat: 34.6817, lng: 135.5017 },
    '堺': { lat: 34.5733, lng: 135.4833 },
    
    // 愛知県
    '名古屋': { lat: 35.1815, lng: 136.9066 },
    '名古屋駅': { lat: 35.1709, lng: 136.8816 },
    '栄': { lat: 35.1700, lng: 136.9083 },
    '大須': { lat: 35.1583, lng: 136.9000 },
    '金山': { lat: 35.1433, lng: 136.9000 },
    '千種': { lat: 35.1700, lng: 136.9333 },
    
    // 福岡県
    '福岡': { lat: 33.5902, lng: 130.4017 },
    '福岡駅': { lat: 33.5902, lng: 130.4203 },
    '天神': { lat: 33.5900, lng: 130.4017 },
    '博多': { lat: 33.5900, lng: 130.4200 },
    '中洲': { lat: 33.5900, lng: 130.4083 },
    
    // 北海道
    '札幌': { lat: 43.0618, lng: 141.3545 },
    '札幌駅': { lat: 43.0686, lng: 141.3508 },
    '大通': { lat: 43.0617, lng: 141.3542 },
    'すすきの': { lat: 43.0550, lng: 141.3500 },
    '薄野': { lat: 43.0550, lng: 141.3500 },
    
    // 神奈川県
    '横浜': { lat: 35.4437, lng: 139.6380 },
    '横浜駅': { lat: 35.4658, lng: 139.6228 },
    'みなとみらい': { lat: 35.4583, lng: 139.6333 },
    '関内': { lat: 35.4433, lng: 139.6333 },
    '横浜元町': { lat: 35.4433, lng: 139.6417 },
    '中華街': { lat: 35.4433, lng: 139.6417 },
    '川崎': { lat: 35.5300, lng: 139.7000 },
    '川崎駅': { lat: 35.5300, lng: 139.7000 },
    '藤沢': { lat: 35.3383, lng: 139.4833 },
    '茅ヶ崎': { lat: 35.3300, lng: 139.4083 },
    
    // 京都府
    '京都': { lat: 35.0116, lng: 135.7681 },
    '京都駅': { lat: 34.9858, lng: 135.7588 },
    '四条河原町': { lat: 35.0033, lng: 135.7683 },
    '祇園': { lat: 35.0050, lng: 135.7750 },
    '清水寺': { lat: 34.9947, lng: 135.7850 },
    '金閣寺': { lat: 35.0394, lng: 135.7292 },
    '銀閣寺': { lat: 35.0272, lng: 135.7981 },
    
    // 兵庫県
    '神戸': { lat: 34.6901, lng: 135.1955 },
    '神戸駅': { lat: 34.6791, lng: 135.1784 },
    '三宮': { lat: 34.6900, lng: 135.1950 },
    '神戸元町': { lat: 34.6833, lng: 135.1833 },
    '北野': { lat: 34.7000, lng: 135.1917 },
    '六甲': { lat: 34.7167, lng: 135.2333 },
    
    // 宮城県
    '仙台': { lat: 38.2688, lng: 140.8721 },
    '仙台駅': { lat: 38.2600, lng: 140.8824 },
    '青葉区': { lat: 38.2688, lng: 140.8721 },
    '宮城野区': { lat: 38.2667, lng: 140.8833 },
    
    // 広島県
    '広島': { lat: 34.3853, lng: 132.4553 },
    '広島駅': { lat: 34.3974, lng: 132.4736 },
    '平和記念公園': { lat: 34.3925, lng: 132.4533 },
    '原爆ドーム': { lat: 34.3955, lng: 132.4533 },
    
    // その他の主要都市
    '千葉': { lat: 35.6075, lng: 140.1064 },
    '千葉駅': { lat: 35.6125, lng: 140.1144 },
    'さいたま': { lat: 35.8614, lng: 139.6456 },
    'さいたま駅': { lat: 35.8614, lng: 139.6456 },
    '新潟': { lat: 37.9022, lng: 139.0232 },
    '新潟駅': { lat: 37.9122, lng: 139.0332 },
    '静岡': { lat: 34.9769, lng: 138.3831 },
    '静岡駅': { lat: 34.9769, lng: 138.3831 },
    '浜松': { lat: 34.7108, lng: 137.7261 },
    '浜松駅': { lat: 34.7108, lng: 137.7261 },
    '岡山': { lat: 34.6617, lng: 133.9350 },
    '岡山駅': { lat: 34.6617, lng: 133.9350 },
    '熊本': { lat: 32.7898, lng: 130.7414 },
    '熊本駅': { lat: 32.7898, lng: 130.7414 },
    '鹿児島': { lat: 31.5602, lng: 130.5581 },
    '鹿児島駅': { lat: 31.5602, lng: 130.5581 },
    '那覇': { lat: 26.2124, lng: 127.6809 },
    '那覇駅': { lat: 26.2124, lng: 127.6809 }
  };
  
  // 入力された住所から主要都市名を検索（部分一致で改善）
  const normalizedAddress = address.toLowerCase().replace(/[　\s]/g, '');
  
  for (const [city, coords] of Object.entries(fallbackCoordinates)) {
    const normalizedCity = city.toLowerCase().replace(/[　\s]/g, '');
    if (normalizedAddress.includes(normalizedCity) || normalizedCity.includes(normalizedAddress)) {
      console.log(`Using ${city} coordinates for: ${address}`);
      return coords;
    }
  }
  
  // デフォルトは東京駅
  console.log(`No specific city found, using default Tokyo Station coordinates for: ${address}`);
  return { lat: 35.6812, lng: 139.7671 };
};

// ランダムな経由地を生成する関数
const generateRandomWaypoints = (
  startPoint: { lat: number; lng: number },
  targetDistance: number,
  transportMode: 'walking' | 'cycling'
): Array<{ lat: number; lng: number }> => {
  const waypoints: Array<{ lat: number; lng: number }> = [];
  const numWaypoints = Math.floor(Math.random() * 3) + 1; // 1-3個の経由地
  
  // 平均的な速度（メートル/秒）
  const speed = transportMode === 'walking' ? 1.4 : 4.0;
  const targetTime = targetDistance * 60; // 分を秒に変換
  const estimatedDistance = speed * targetTime;
  
  // 経由地の間隔を計算
  const segmentDistance = estimatedDistance / (numWaypoints + 1);
  
  for (let i = 0; i < numWaypoints; i++) {
    // ランダムな方向と距離で経由地を生成
    const angle = Math.random() * 2 * Math.PI;
    const distance = segmentDistance * (i + 1) + (Math.random() - 0.5) * segmentDistance * 0.5;
    
    // 緯度経度の差分を計算（簡易版）
    const latDiff = (distance * Math.cos(angle)) / 111000; // 1度 ≈ 111km
    const lngDiff = (distance * Math.sin(angle)) / (111000 * Math.cos(startPoint.lat * Math.PI / 180));
    
    waypoints.push({
      lat: startPoint.lat + latDiff,
      lng: startPoint.lng + lngDiff
    });
  }
  
  return waypoints;
};

// ルートの座標を生成する関数
const generateRouteCoordinates = (
  startPoint: { lat: number; lng: number },
  waypoints: Array<{ lat: number; lng: number }>,
  endPoint: { lat: number; lng: number }
): Array<{ lat: number; lng: number }> => {
  const route: Array<{ lat: number; lng: number }> = [];
  
  // スタート地点から各経由地、そしてゴール地点まで直線で結ぶ
  const allPoints = [startPoint, ...waypoints, endPoint];
  
  for (let i = 0; i < allPoints.length - 1; i++) {
    const start = allPoints[i];
    const end = allPoints[i + 1];
    
    // 2点間を10個の点で分割
    for (let j = 0; j <= 10; j++) {
      const ratio = j / 10;
      route.push({
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio
      });
    }
  }
  
  return route;
};

// 距離を計算する関数
const calculateDistance = (route: Array<{ lat: number; lng: number }>): number => {
  let totalDistance = 0;
  
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i];
    const p2 = route[i + 1];
    
    // ハバーサイン公式で距離を計算
    const R = 6371000; // 地球の半径（メートル）
    const lat1 = p1.lat * Math.PI / 180;
    const lat2 = p2.lat * Math.PI / 180;
    const deltaLat = (p2.lat - p1.lat) * Math.PI / 180;
    const deltaLng = (p2.lng - p1.lng) * Math.PI / 180;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    totalDistance += R * c;
  }
  
  return totalDistance;
};

// メインのルート生成関数
export const generateRandomRoute = async (formData: RouteFormData): Promise<RouteData> => {
  try {
    // スタート地点の座標を取得
    const startPoint = await geocodeAddress(formData.startAddress);
    
    // ランダムな経由地を生成
    const waypoints = generateRandomWaypoints(
      startPoint,
      formData.duration,
      formData.transportMode
    );
    
    // ゴール地点は最後の経由地から少し離れた場所に設定
    const lastWaypoint = waypoints[waypoints.length - 1];
    const endPoint = {
      lat: lastWaypoint.lat + (Math.random() - 0.5) * 0.01,
      lng: lastWaypoint.lng + (Math.random() - 0.5) * 0.01
    };
    
    // ルートの座標を生成
    const route = generateRouteCoordinates(startPoint, waypoints, endPoint);
    
    // 距離を計算
    const distance = calculateDistance(route);
    
    // 時間を計算（速度に基づいて）
    const speed = formData.transportMode === 'walking' ? 1.4 : 4.0; // メートル/秒
    const duration = distance / speed;
    
    // 経由地の住所を取得（簡易版）
    const waypointsWithAddress = waypoints.map((waypoint, index) => {
      return {
        ...waypoint,
        address: `経由地 ${index + 1}`
      };
    });
    
    // ゴール地点の住所を取得
    let endAddress = 'ゴール地点';
    
    return {
      startPoint: {
        ...startPoint,
        address: formData.startAddress
      },
      endPoint: {
        ...endPoint,
        address: endAddress
      },
      waypoints: waypointsWithAddress,
      route,
      distance,
      duration,
      transportMode: formData.transportMode
    };
    
  } catch (error) {
    console.error('ルート生成エラー:', error);
    throw new Error('まぁ！ルートの生成に失敗いたしましたわ。もう一度お試しくださいまし！');
  }
}; 
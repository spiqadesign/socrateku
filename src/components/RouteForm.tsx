import React, { useState, useEffect } from 'react';
import { RouteFormData, RouteData } from '../types';
import { generateRandomRoute } from '../services/routeService';

interface RouteFormProps {
  onRouteGenerated: (data: RouteData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// 一般的な住所の候補リスト
const commonAddresses = [
  '東京駅',
  '新宿駅',
  '渋谷駅',
  '池袋駅',
  '銀座',
  '原宿',
  '六本木',
  '秋葉原',
  '浅草',
  '上野',
  '品川駅',
  '目黒',
  '恵比寿',
  '中目黒',
  '代官山',
  '自由が丘',
  '三軒茶屋',
  '下北沢',
  '吉祥寺',
  '立川',
  '八王子',
  '町田',
  '大阪駅',
  '梅田',
  '難波',
  '心斎橋',
  '天王寺',
  '新大阪',
  '京橋',
  '淀屋橋',
  '本町',
  '堺',
  '名古屋駅',
  '栄',
  '大須',
  '金山',
  '千種',
  '福岡駅',
  '天神',
  '博多',
  '中洲',
  '札幌駅',
  '大通',
  'すすきの',
  '薄野',
  '横浜駅',
  'みなとみらい',
  '関内',
  '横浜元町',
  '中華街',
  '川崎駅',
  '藤沢',
  '茅ヶ崎',
  '京都駅',
  '四条河原町',
  '祇園',
  '清水寺',
  '金閣寺',
  '銀閣寺',
  '神戸駅',
  '三宮',
  '神戸元町',
  '北野',
  '六甲',
  '仙台駅',
  '青葉区',
  '宮城野区',
  '広島駅',
  '平和記念公園',
  '原爆ドーム',
  '千葉駅',
  'さいたま駅',
  '新潟駅',
  '静岡駅',
  '浜松駅',
  '岡山駅',
  '熊本駅',
  '鹿児島駅',
  '那覇駅'
];

const RouteForm: React.FC<RouteFormProps> = ({ 
  onRouteGenerated, 
  isLoading, 
  setIsLoading 
}) => {
  const [formData, setFormData] = useState<RouteFormData>({
    duration: 30,
    startAddress: '',
    transportMode: 'walking'
  });

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 住所の候補をフィルタリングする関数
  const filterAddressSuggestions = (input: string) => {
    if (!input.trim()) {
      setAddressSuggestions([]);
      return;
    }

    const filtered = commonAddresses.filter(address =>
      address.toLowerCase().includes(input.toLowerCase())
    );
    setAddressSuggestions(filtered.slice(0, 5)); // 最大5件まで表示
  };

  // 住所入力時の処理
  const handleAddressChange = (value: string) => {
    handleInputChange('startAddress', value);
    filterAddressSuggestions(value);
    setShowSuggestions(true);
  };

  // 候補を選択した時の処理
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange('startAddress', suggestion);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  // フォーカスが外れた時の処理
  const handleAddressBlur = () => {
    // 少し遅延させてから候補を隠す（クリックイベントが先に処理されるように）
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startAddress.trim()) {
      alert('出発地を入力してくださいまし！');
      return;
    }

    setIsLoading(true);
    
    try {
      const routeData = await generateRandomRoute(formData);
      onRouteGenerated(routeData);
    } catch (error) {
      console.error('ルート生成エラー:', error);
      alert('まぁ！ルートの生成に失敗いたしましたわ。もう一度お試しくださいまし！');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RouteFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-noble-800 mb-2">
          ルート設定
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-noble-700 mb-2">
            運動時間（分）
          </label>
          <select
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-noble-300 rounded-md focus:outline-none focus:ring-2 focus:ring-noble-500"
            disabled={isLoading}
          >
            <option value={15}>15分</option>
            <option value={30}>30分</option>
            <option value={45}>45分</option>
            <option value={60}>60分</option>
            <option value={90}>90分</option>
            <option value={120}>120分</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-noble-700 mb-2">
            出発地
          </label>
          <input
            type="text"
            value={formData.startAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleAddressBlur}
            placeholder="例: 東京駅"
            className="w-full px-3 py-2 border border-noble-300 rounded-md focus:outline-none focus:ring-2 focus:ring-noble-500"
            disabled={isLoading}
          />
          
          {/* 住所候補のドロップダウン */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-noble-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-noble-100 focus:bg-noble-100 focus:outline-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-noble-700 mb-2">
            運動方法
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="walking"
                checked={formData.transportMode === 'walking'}
                onChange={(e) => handleInputChange('transportMode', e.target.value)}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-noble-700">🚶 徒歩</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="cycling"
                checked={formData.transportMode === 'cycling'}
                onChange={(e) => handleInputChange('transportMode', e.target.value)}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-noble-700">🚴 自転車</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-noble-600 text-white py-3 px-4 rounded-md hover:bg-noble-700 focus:outline-none focus:ring-2 focus:ring-noble-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="noble-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ルート生成中...
            </div>
          ) : (
            '🏰 高貴なるルートを生成いたしますわ！'
          )}
        </button>
      </form>

      {isLoading && (
        <div className="text-center text-noble-600">
          <p>わたくしが最適なルートを計算しておりますわ...</p>
        </div>
      )}
    </div>
  );
};

export default RouteForm; 
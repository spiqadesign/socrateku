import React, { useState } from 'react';
import RouteForm from './components/RouteForm';
import RouteMap from './components/RouteMap';
import { RouteData } from './types';

function App() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRouteGenerated = (data: RouteData) => {
    setRouteData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noble-50 to-noble-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-noble-800 mb-2">
            ソクラてく
          </h1>
          <p className="text-noble-600 text-lg">
            私はどこを歩けばいいのかを知らない。でも、それを知っている。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <RouteForm 
              onRouteGenerated={handleRouteGenerated}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="min-h-96">
              {routeData ? (
                <RouteMap routeData={routeData} />
              ) : (
                <div className="h-96 flex items-center justify-center text-noble-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-lg">ルートを生成してください</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 
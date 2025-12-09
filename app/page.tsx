'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import RoleSelector from '@/components/RoleSelector';
import AnalysisCard from '@/components/AnalysisCard';
import VesselPositionMap from '@/components/VesselPositionMap';
import FleetOverview from '@/components/FleetOverview';
import type { Role, AnalysisResult, Cargo } from '@/lib/types';
import { sampleCargoes, currentVesselPosition, bunkerPorts } from '@/lib/dummyData';
import { analyzeCargo } from '@/lib/agents';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>('charterer');
  const [fixedCargoId, setFixedCargoId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [robVerified, setRobVerified] = useState(false);

  // Generate analyses for sample cargoes
  useEffect(() => {
    const generateAnalyses = () => {
      const results = sampleCargoes.map((cargo) => analyzeCargo(cargo));
      setAnalyses(results);
    };
    generateAnalyses();
  }, []);

  const handleFixCargo = (cargoId: string) => {
    setFixedCargoId(cargoId);
  };

  const handleBookBunker = (analysis: AnalysisResult) => {
    alert(`Booking bunker at ${analysis.recommendedBunkerPort.name}\nQuantity: ${analysis.bunkerQuantity.VLSFO} MT VLSFO, ${analysis.bunkerQuantity.LSMGO} MT LSMGO\nTotal Cost: $${analysis.totalBunkerCost.toLocaleString()}`);
  };

  const handleVerifyROB = () => {
    setRobVerified(true);
    // Update analyses with verified ROB
    setAnalyses(prev => prev.map(a => ({
      ...a,
      currentROB: {
        ...a.currentROB,
        verified: true,
        vesselConfirmed: true,
      }
    })));
  };

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargoInput: message }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'complete' && data.data?.results) {
                setAnalyses(data.data.results);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  // Find best option (highest net profit)
  const bestOptionId = analyses.length > 0
    ? analyses.reduce((best, current) => 
        current.netProfit > best.netProfit ? current : best
      ).cargoId
    : null;

  // Calculate fleet metrics
  const totalBunkerSpend = analyses.reduce((sum, a) => sum + a.totalBunkerCost, 0);
  const efficiency = analyses.length > 0
    ? (analyses.filter(a => a.viable).length / analyses.length) * 100
    : 0;
  const unverifiedCount = analyses.filter(a => !a.currentROB.verified).length;

  // Get fixed cargo analysis
  const fixedAnalysis = fixedCargoId
    ? analyses.find(a => a.cargoId === fixedCargoId)
    : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FuelSense Bot
          </h1>
          <p className="text-gray-600">
            Maritime fuel analysis and cargo optimization platform
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>

        {/* Chat Interface */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-700">Chat Interface</span>
          </div>
          <div className="p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter cargo details (e.g., 'from Rotterdam to Singapore')..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !message.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>

        {/* Role-specific Views */}
        {selectedRole === 'charterer' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cargo Comparison
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyses.map((analysis) => {
                  const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
                  return (
                    <AnalysisCard
                      key={analysis.cargoId}
                      analysis={analysis}
                      role={selectedRole}
                      cargo={cargo}
                      isBestOption={analysis.cargoId === bestOptionId}
                      onFixCargo={handleFixCargo}
                      isFixed={fixedCargoId === analysis.cargoId}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedRole === 'operator' && (
          <div className="space-y-6">
            {fixedAnalysis ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Fixed Cargo: {sampleCargoes.find(c => c.id === fixedAnalysis.cargoId)?.from} → {sampleCargoes.find(c => c.id === fixedAnalysis.cargoId)?.to}
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Fixed
                  </span>
                </div>
                <AnalysisCard
                  analysis={fixedAnalysis}
                  role={selectedRole}
                  cargo={sampleCargoes.find(c => c.id === fixedAnalysis.cargoId)}
                  onBookBunker={handleBookBunker}
                  isFixed={true}
                />
                
                {/* Additional Bunker Port Options */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    All Available Bunker Ports
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bunkerPorts.map((port) => {
                      const isRecommended = port.name === fixedAnalysis.recommendedBunkerPort.name;
                      return (
                        <div 
                          key={port.name} 
                          className={`bg-gray-50 border-2 rounded-lg p-4 ${
                            isRecommended 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-900">{port.name}</div>
                            {isRecommended && (
                              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-sm space-y-1 text-gray-600">
                            <div className="flex justify-between">
                              <span>VLSFO:</span>
                              <span className="font-semibold">${port.VLSFO_price}/MT</span>
                            </div>
                            <div className="flex justify-between">
                              <span>LSMGO:</span>
                              <span className="font-semibold">${port.LSMGO_price}/MT</span>
                            </div>
                            {port.deviation_nm > 0 && (
                              <div className="text-xs text-gray-500 pt-1">
                                Deviation: +{port.deviation_nm} nm ({port.deviation_days.toFixed(1)} days)
                              </div>
                            )}
                            <div className="pt-2 border-t border-gray-200 mt-2">
                              <div className="font-medium text-gray-700 mb-1">Availability</div>
                              <div className="text-xs space-y-0.5">
                                <div>
                                  VLSFO: {port.VLSFO_available ? '✅ Available' : '❌ Unavailable'}
                                </div>
                                <div>
                                  LSMGO: {port.LSMGO_available ? '✅ Available' : '❌ Unavailable'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800 font-semibold">
                  No cargo fixed yet. Please wait for charterer to fix a cargo.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedRole === 'vessel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Vessel Position
              </h2>
              <VesselPositionMap position={currentVesselPosition} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cargo Analysis (Read-Only)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyses.map((analysis) => {
                  const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
                  const analysisWithVerified = robVerified ? {
                    ...analysis,
                    currentROB: {
                      ...analysis.currentROB,
                      verified: true,
                      vesselConfirmed: true,
                    }
                  } : analysis;
                  return (
                    <AnalysisCard
                      key={analysis.cargoId}
                      analysis={analysisWithVerified}
                      role={selectedRole}
                      cargo={cargo}
                      onVerifyROB={handleVerifyROB}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedRole === 'vessel_manager' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Fleet Overview
              </h2>
              <FleetOverview
                analyses={analyses}
                totalBunkerSpend={totalBunkerSpend}
                efficiency={efficiency}
                unverifiedCount={unverifiedCount}
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cargo Analysis (Read-Only)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyses.map((analysis) => {
                  const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
                  return (
                    <AnalysisCard
                      key={analysis.cargoId}
                      analysis={analysis}
                      role={selectedRole}
                      cargo={cargo}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

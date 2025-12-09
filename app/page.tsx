'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import RoleSelector from '@/components/RoleSelector';
import AnalysisCard from '@/components/AnalysisCard';
import VesselPositionMap from '@/components/VesselPositionMap';
import FleetOverview from '@/components/FleetOverview';
import SkeletonLoader from '@/components/SkeletonLoader';
import StreamingStatus from '@/components/StreamingStatus';
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
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Generate analyses for sample cargoes
  useEffect(() => {
    const generateAnalyses = async () => {
      setIsInitialLoading(true);
      try {
        // Simulate loading for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        const results = sampleCargoes.map((cargo) => analyzeCargo(cargo));
        setAnalyses(results);
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setIsInitialLoading(false);
      }
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

  const handleAnalyze = async (retryCount = 0) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setStreamingStatus('🔍 Getting vessel ROBs...');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargoInput: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

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
              if (data.type === 'status' && data.data?.message) {
                setStreamingStatus(data.data.message);
              } else if (data.type === 'complete' && data.data?.results) {
                setAnalyses(data.data.results);
                setStreamingStatus(null);
              } else if (data.type === 'error') {
                throw new Error(data.data?.message || 'Analysis failed');
              }
            } catch (e) {
              // Ignore parse errors for non-critical messages
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze cargo';
      setError(errorMessage);
      setStreamingStatus(null);
      
      // Auto-retry once
      if (retryCount === 0) {
        setTimeout(() => handleAnalyze(1), 2000);
        return;
      }
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleLoadExample = () => {
    setMessage('Analyze cargoes: Rotterdam to Singapore and Rotterdam to US East Coast');
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
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-gray-700">Chat Interface</span>
            </div>
            <button
              onClick={handleLoadExample}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Load Example
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAnalyze()}
                placeholder="Enter cargo details (e.g., 'from Rotterdam to Singapore')..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                disabled={isLoading}
              />
              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading || !message.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
            
            {/* Streaming Status */}
            {streamingStatus && (
              <div className="pt-2">
                <StreamingStatus message={streamingStatus} isStreaming={isLoading} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-in">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    if (message.trim()) handleAnalyze();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific Views */}
        {isInitialLoading ? (
          <div className="space-y-6">
            <SkeletonLoader />
            <SkeletonLoader />
          </div>
        ) : (
          <>
            {selectedRole === 'charterer' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Cargo Comparison
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {analyses.map((analysis, index) => {
                      const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
                      return (
                        <div key={analysis.cargoId} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <AnalysisCard
                            analysis={analysis}
                            role={selectedRole}
                            cargo={cargo}
                            isBestOption={analysis.cargoId === bestOptionId}
                            onFixCargo={handleFixCargo}
                            isFixed={fixedCargoId === analysis.cargoId}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'operator' && (
              <div className="space-y-6 animate-fade-in">
                {fixedAnalysis ? (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                    <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Fixed Cargo: {sampleCargoes.find(c => c.id === fixedAnalysis.cargoId)?.from} → {sampleCargoes.find(c => c.id === fixedAnalysis.cargoId)?.to}
                      </h2>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Fixed
                      </span>
                    </div>
                    <div className="animate-fade-in">
                      <AnalysisCard
                        analysis={fixedAnalysis}
                        role={selectedRole}
                        cargo={sampleCargoes.find(c => c.id === fixedAnalysis.cargoId)}
                        onBookBunker={handleBookBunker}
                        isFixed={true}
                      />
                    </div>
                    
                    {/* Additional Bunker Port Options */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        All Available Bunker Ports
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {bunkerPorts.map((port, index) => {
                          const isRecommended = port.name === fixedAnalysis.recommendedBunkerPort.name;
                          return (
                            <div 
                              key={port.name}
                              className={`bg-gray-50 border-2 rounded-lg p-4 animate-fade-in ${
                                isRecommended 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200'
                              }`}
                              style={{ animationDelay: `${index * 0.1}s` }}
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center animate-fade-in">
                    <p className="text-yellow-800 font-semibold">
                      No cargo fixed yet. Please wait for charterer to fix a cargo.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedRole === 'vessel' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Vessel Position
                  </h2>
                  <div className="animate-fade-in">
                    <VesselPositionMap position={currentVesselPosition} />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Cargo Analysis (Read-Only)
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {analyses.map((analysis, index) => {
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
                        <div key={analysis.cargoId} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <AnalysisCard
                            analysis={analysisWithVerified}
                            role={selectedRole}
                            cargo={cargo}
                            onVerifyROB={handleVerifyROB}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'vessel_manager' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Fleet Overview
                  </h2>
                  <div className="animate-fade-in">
                    <FleetOverview
                      analyses={analyses}
                      totalBunkerSpend={totalBunkerSpend}
                      efficiency={efficiency}
                      unverifiedCount={unverifiedCount}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Cargo Analysis (Read-Only)
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {analyses.map((analysis, index) => {
                      const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
                      return (
                        <div key={analysis.cargoId} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <AnalysisCard
                            analysis={analysis}
                            role={selectedRole}
                            cargo={cargo}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

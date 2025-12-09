'use client';

import { Ship, CheckCircle2, XCircle, AlertTriangle, MapPin, DollarSign, Fuel, Check, ShoppingCart, Phone } from 'lucide-react';
import type { AnalysisResult, Role, Cargo } from '@/lib/types';
import { sampleCargoes } from '@/lib/dummyData';

interface AnalysisCardProps {
  analysis: AnalysisResult;
  role: Role;
  cargo?: Cargo;
  isBestOption?: boolean;
  onFixCargo?: (cargoId: string) => void;
  onBookBunker?: (analysis: AnalysisResult) => void;
  onVerifyROB?: () => void;
  isFixed?: boolean;
}

export default function AnalysisCard({ 
  analysis, 
  role, 
  cargo, 
  isBestOption = false,
  onFixCargo,
  onBookBunker,
  onVerifyROB,
  isFixed = false,
}: AnalysisCardProps) {
  // Get cargo info if not provided
  const cargoInfo = cargo || sampleCargoes.find((c) => c.id === analysis.cargoId);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const viabilityColor = analysis.viable
    ? 'bg-green-50 border-green-200'
    : 'bg-red-50 border-red-200';
  
  const viabilityTextColor = analysis.viable
    ? 'text-green-700'
    : 'text-red-700';

  const viabilityIcon = analysis.viable ? (
    <CheckCircle2 className="w-5 h-5 text-green-600" />
  ) : (
    <XCircle className="w-5 h-5 text-red-600" />
  );

  const routeLabel = cargoInfo
    ? `${cargoInfo.from} → ${cargoInfo.to}`
    : `Route ${analysis.cargoId}`;

  return (
    <div
      className={`relative border-2 rounded-lg shadow-lg overflow-hidden transition-all ${
        isBestOption
          ? 'ring-4 ring-blue-400 ring-opacity-50 border-blue-300'
          : viabilityColor
      }`}
    >
      {/* Best Option Badge */}
      {isBestOption && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          ⭐ BEST OPTION
        </div>
      )}

      {/* Header */}
      <div className={`px-4 py-3 border-b ${viabilityColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-gray-600" />
          <span className="font-bold text-gray-900">{routeLabel}</span>
        </div>
        <div className={`flex items-center gap-2 ${viabilityTextColor}`}>
          {viabilityIcon}
          <span className="font-semibold">
            {analysis.viable ? 'VIABLE' : 'NOT VIABLE'}
          </span>
          {analysis.viable && (
            <span className="text-sm font-medium">
              | Net Profit: {formatCurrency(analysis.netProfit)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 bg-white">
        {/* Current ROB */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">
              Current ROB
              {!analysis.currentROB.verified ? (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Unverified
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 px-3 py-2 rounded">
              <span className="text-gray-600">VLSFO:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatNumber(analysis.currentROB.VLSFO)} MT
              </span>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded">
              <span className="text-gray-600">LSMGO:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatNumber(analysis.currentROB.LSMGO)} MT
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Departure ROB */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">
              Est. Departure ROB ({cargoInfo?.from || 'Port'})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 px-3 py-2 rounded border border-blue-100">
              <span className="text-gray-600">VLSFO:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatNumber(analysis.estimatedDepartureROB.VLSFO)} MT
              </span>
            </div>
            <div className="bg-blue-50 px-3 py-2 rounded border border-blue-100">
              <span className="text-gray-600">LSMGO:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatNumber(analysis.estimatedDepartureROB.LSMGO)} MT
              </span>
            </div>
          </div>
        </div>

        {/* Route Required */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Route Required</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-purple-50 px-3 py-2 rounded border border-purple-100">
              <span className="text-gray-600">VLSFO:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatNumber(analysis.requiredROB.VLSFO)} MT
              </span>
            </div>
            <div className="bg-purple-50 px-3 py-2 rounded border border-purple-100">
              <span className="text-gray-600">LSMGO:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatNumber(analysis.requiredROB.LSMGO)} MT
              </span>
            </div>
          </div>
          {(analysis.shortfall.VLSFO > 0 || analysis.shortfall.LSMGO > 0) && (
            <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded">
              <span className="text-sm font-medium text-orange-800">
                Shortfall:{' '}
                {analysis.shortfall.VLSFO > 0 && (
                  <span>{formatNumber(analysis.shortfall.VLSFO)} MT VLSFO</span>
                )}
                {analysis.shortfall.VLSFO > 0 && analysis.shortfall.LSMGO > 0 && ' | '}
                {analysis.shortfall.LSMGO > 0 && (
                  <span>{formatNumber(analysis.shortfall.LSMGO)} MT LSMGO</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Recommended Bunker Port */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">
              📍 Recommended: Bunker at {analysis.recommendedBunkerPort.name}
            </span>
          </div>
          <div className="bg-indigo-50 px-3 py-2 rounded border border-indigo-100 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Deviation:</span>
              <span className="font-semibold text-gray-900">
                {analysis.recommendedBunkerPort.deviation_nm > 0 ? '+' : ''}
                {formatNumber(analysis.recommendedBunkerPort.deviation_nm)} nm
                {analysis.recommendedBunkerPort.deviation_days > 0 && (
                  <span className="text-gray-600 ml-1">
                    (+{analysis.recommendedBunkerPort.deviation_days.toFixed(1)} days)
                  </span>
                )}
              </span>
            </div>
            {analysis.bunkerQuantity.VLSFO > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bunker VLSFO:</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(analysis.bunkerQuantity.VLSFO)} MT @{' '}
                  {formatCurrency(analysis.recommendedBunkerPort.VLSFO_price)}/MT
                </span>
              </div>
            )}
            {analysis.bunkerQuantity.LSMGO > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bunker LSMGO:</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(analysis.bunkerQuantity.LSMGO)} MT @{' '}
                  {formatCurrency(analysis.recommendedBunkerPort.LSMGO_price)}/MT
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-indigo-200">
              <span className="text-gray-700 font-medium">Total Bunker Cost:</span>
              <span className="font-bold text-indigo-700">
                {formatCurrency(analysis.totalBunkerCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Economics */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-700">💰 Economics</span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded border border-green-100 space-y-1 text-sm">
            {cargoInfo && (
              <div className="flex justify-between">
                <span className="text-gray-600">Freight:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(cargoInfo.freight)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Bunker Cost:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(analysis.totalBunkerCost)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-green-200">
              <span className="text-gray-700 font-bold">Net Profit:</span>
              <span
                className={`font-bold ${
                  analysis.netProfit > 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {formatCurrency(analysis.netProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Distance:</span>
            <span className="font-medium">
              {formatNumber(analysis.route.distance_nm)} nm
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sailing Days:</span>
            <span className="font-medium">{analysis.route.sailing_days} days</span>
          </div>
          {analysis.route.SECA_distance_nm && (
            <div className="flex justify-between">
              <span>SECA Distance:</span>
              <span className="font-medium text-orange-600">
                {formatNumber(analysis.route.SECA_distance_nm)} nm
              </span>
            </div>
          )}
        </div>

        {/* Role-specific Actions */}
        <div className="pt-3 border-t border-gray-200">
          {role === 'charterer' && (
            <button
              onClick={() => onFixCargo?.(analysis.cargoId)}
              disabled={isFixed || !analysis.viable}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                isFixed
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : analysis.viable
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isFixed ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Cargo Fixed
                </span>
              ) : (
                'Fix Cargo'
              )}
            </button>
          )}

          {role === 'operator' && isFixed && (
            <div className="space-y-2">
              <button
                onClick={() => onBookBunker?.(analysis)}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Book Bunker
              </button>
              <div className="bg-gray-50 px-3 py-2 rounded text-xs">
                <div className="font-semibold text-gray-700 mb-1">Port Agent Contact:</div>
                <div className="text-gray-600 space-y-0.5">
                  <div>Name: {analysis.recommendedBunkerPort.name} Port Services</div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    +1-{Math.floor(Math.random() * 900) + 100}-{Math.floor(Math.random() * 900) + 100}-{Math.floor(Math.random() * 9000) + 1000}
                  </div>
                  <div>Email: agent@{analysis.recommendedBunkerPort.name.toLowerCase().replace(' ', '')}.com</div>
                </div>
              </div>
            </div>
          )}

          {role === 'vessel' && !analysis.currentROB.verified && (
            <button
              onClick={onVerifyROB}
              className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify ROBs
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

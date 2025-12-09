'use client';

import { Ship, AlertTriangle, TrendingUp, DollarSign, Fuel } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';

interface FleetOverviewProps {
  analyses: AnalysisResult[];
  totalBunkerSpend: number;
  efficiency: number;
  unverifiedCount: number;
}

export default function FleetOverview({ 
  analyses, 
  totalBunkerSpend, 
  efficiency,
  unverifiedCount 
}: FleetOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const viableCargoes = analyses.filter(a => a.viable).length;
  const totalProfit = analyses.reduce((sum, a) => sum + a.netProfit, 0);

  return (
    <div className="space-y-4">
      {/* Strategic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Total Bunker Spend</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(totalBunkerSpend)}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-gray-700">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {efficiency.toFixed(1)}%
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ship className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Viable Cargoes</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {viableCargoes}/{analyses.length}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-semibold text-gray-700">Unverified Data</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {unverifiedCount}
          </div>
        </div>
      </div>

      {/* Total Profit Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Total Potential Profit</div>
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(totalProfit)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Average per Cargo</div>
            <div className="text-xl font-semibold text-gray-800">
              {formatCurrency(analyses.length > 0 ? totalProfit / analyses.length : 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


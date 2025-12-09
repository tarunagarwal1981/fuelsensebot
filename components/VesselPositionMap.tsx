'use client';

import { MapPin, Navigation } from 'lucide-react';
import type { VesselPosition } from '@/lib/types';

interface VesselPositionMapProps {
  position: VesselPosition;
}

export default function VesselPositionMap({ position }: VesselPositionMapProps) {
  return (
    <div className="bg-gray-100 rounded-lg border border-gray-300 p-4 h-64 relative overflow-hidden">
      {/* Map Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-100 to-green-100 opacity-50"></div>
      
      {/* Map Grid Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      {/* Position Marker */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md text-xs font-semibold">
            <MapPin className="w-3 h-3 inline mr-1" />
            {position.currentPort}
          </div>
        </div>
      </div>

      {/* Next Port Indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-xs text-gray-500">Next Port</div>
            <div className="font-semibold text-gray-900">{position.nextPort}</div>
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 text-xs">
        <div className="font-semibold text-gray-700 mb-1">Position</div>
        <div className="text-gray-600">
          {position.lat.toFixed(2)}°N, {position.lon.toFixed(2)}°E
        </div>
        <div className="text-gray-600 mt-1">
          Speed: {position.speed} knots
        </div>
      </div>

      {/* ETA */}
      <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 text-xs">
        <div className="font-semibold text-gray-700 mb-1">ETA</div>
        <div className="text-gray-600">
          {new Date(position.eta).toLocaleString()}
        </div>
      </div>
    </div>
  );
}


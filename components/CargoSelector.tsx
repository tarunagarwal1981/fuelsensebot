'use client';

import { Ship, MapPin, Check } from 'lucide-react';
import { useState } from 'react';

interface CargoSelectorProps {
  onConfirm: (selections: {
    vessel: string;
    fromPort: string;
    toPorts: string[];
  }) => void;
  onCancel?: () => void;
}

const vessels = [
  { id: 'MV Ocean Pride', name: 'MV Ocean Pride' },
  { id: 'MV Atlantic Star', name: 'MV Atlantic Star' },
  { id: 'MV Pacific Wave', name: 'MV Pacific Wave' },
];

const fromPorts = [
  'Rotterdam',
  'Singapore',
  'Hong Kong',
  'Shanghai',
  'Dubai',
  'New York',
  'Los Angeles',
];

const toPorts = [
  'Singapore',
  'Hong Kong',
  'Shanghai',
  'Dubai',
  'Rotterdam',
  'US East Coast',
  'US West Coast',
  'Panama',
  'Gibraltar',
];

export default function CargoSelector({ onConfirm, onCancel }: CargoSelectorProps) {
  const [selectedVessel, setSelectedVessel] = useState('MV Ocean Pride');
  const [selectedFromPort, setSelectedFromPort] = useState('Rotterdam');
  const [selectedToPorts, setSelectedToPorts] = useState<string[]>([]);

  const toggleToPort = (port: string) => {
    setSelectedToPorts(prev =>
      prev.includes(port)
        ? prev.filter(p => p !== port)
        : [...prev, port]
    );
  };

  const handleConfirm = () => {
    if (selectedToPorts.length === 0) {
      alert('Please select at least one destination port');
      return;
    }
    onConfirm({
      vessel: selectedVessel,
      fromPort: selectedFromPort,
      toPorts: selectedToPorts,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg max-w-2xl w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Select Cargo Details
      </h3>

      {/* Vessel Selection */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Ship className="w-4 h-4" />
          Vessel
        </label>
        <div className="grid grid-cols-3 gap-2">
          {vessels.map(vessel => (
            <button
              key={vessel.id}
              onClick={() => setSelectedVessel(vessel.id)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                selectedVessel === vessel.id
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {vessel.name}
            </button>
          ))}
        </div>
      </div>

      {/* From Port Selection */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4" />
          From Port
        </label>
        <div className="grid grid-cols-4 gap-2">
          {fromPorts.map(port => (
            <button
              key={port}
              onClick={() => setSelectedFromPort(port)}
              className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                selectedFromPort === port
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {port}
            </button>
          ))}
        </div>
      </div>

      {/* To Ports Selection (Multiple) */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4" />
          To Ports (Select one or more)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {toPorts.map(port => {
            const isSelected = selectedToPorts.includes(port);
            return (
              <button
                key={port}
                onClick={() => toggleToPort(port)}
                className={`px-3 py-2 rounded-lg border-2 transition-all text-sm flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
                {port}
              </button>
            );
          })}
        </div>
        {selectedToPorts.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedToPorts.join(', ')} ({selectedToPorts.length} analysis{selectedToPorts.length > 1 ? 'es' : ''} will be generated)
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleConfirm}
          disabled={selectedToPorts.length === 0}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
        >
          Analyze {selectedToPorts.length > 0 ? `(${selectedToPorts.length})` : ''}
        </button>
      </div>
    </div>
  );
}


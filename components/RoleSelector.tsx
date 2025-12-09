'use client';

import { User, Building2, Ship, BarChart3 } from 'lucide-react';
import type { Role } from '@/lib/types';

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const roles: { value: Role; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'charterer',
      label: 'Charterer',
      icon: <User className="w-5 h-5" />,
      description: 'Fix cargo, compare profits',
    },
    {
      value: 'operator',
      label: 'Operator',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Book bunkers, manage operations',
    },
    {
      value: 'vessel',
      label: 'Vessel',
      icon: <Ship className="w-5 h-5" />,
      description: 'Verify ROBs, update position',
    },
    {
      value: 'vessel_manager',
      label: 'Vessel Manager',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Fleet overview, strategic metrics',
    },
  ];

  return (
    <div className="flex gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {roles.map((role) => (
        <button
          key={role.value}
          onClick={() => onRoleChange(role.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
            selectedRole === role.value
              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          {role.icon}
          <div className="text-left">
            <div className="font-semibold text-sm">{role.label}</div>
            <div className="text-xs text-gray-500">{role.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

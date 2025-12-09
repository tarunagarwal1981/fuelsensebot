'use client';

import { Ship, Settings, Anchor, BarChart3 } from 'lucide-react';
import type { Role } from '@/lib/types';
import { NotificationBadge } from './NotificationBadge';

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
  notifications: Record<Role, number>; // Add this prop
}

export default function RoleSelector({ selectedRole, onRoleChange, notifications }: RoleSelectorProps) {
  const roles: { role: Role; label: string; icon: any }[] = [
    { role: 'charterer', label: 'Charterer', icon: Ship },
    { role: 'operator', label: 'Operator', icon: Settings },
    { role: 'vessel', label: 'Vessel', icon: Anchor },
    { role: 'vessel_manager', label: 'Vessel Manager', icon: BarChart3 }
  ];

  return (
    <div className="flex gap-2 border-b border-gray-200">
      {roles.map(({ role, label, icon: Icon }) => {
        const isActive = selectedRole === role;
        const notifCount = notifications[role] || 0;
        
        return (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={`relative px-4 py-2 font-medium transition-all ${
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {label}
            </div>
            <NotificationBadge count={notifCount} message={`${notifCount} pending`} />
          </button>
        );
      })}
    </div>
  );
}

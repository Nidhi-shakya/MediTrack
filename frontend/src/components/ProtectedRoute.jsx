// [Requirement 1: Multiple React Components]
// [Requirement 8: React Router & Protected Routes]
// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { staffUser } = useClinic();
  const location = useLocation();

  // If staff user is not logged in, redirect to login page with return url
  if (!staffUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are mandated and user's role is not included
  if (allowedRoles && !allowedRoles.includes(staffUser.role)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm text-center">
        <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Restricted Staff Access</h2>
        <p className="text-sm text-slate-600 mt-2">
          Your current session role (<span className="font-semibold text-amber-700 uppercase">{staffUser.role}</span>) does not have clearance for this medical terminal.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Allowed Roles: {allowedRoles.join(', ').toUpperCase()}
        </p>
      </div>
    );
  }

  return children;
};


// [Requirement 1: Multiple React Components]
// [Requirement 6: Props & State - Child Component Receiving Data via Props]
// [Requirement 7: Conditional Rendering]
// frontend/src/components/StatCard.jsx

import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'teal',
  subtitle,
  badge,
}) => {
  // Color configuration map for medical aesthetic
  const colorMap = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      iconBg: 'bg-teal-100 text-teal-700',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
    },
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-white border ${scheme.border} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>

            {/* [Requirement 7: Conditional Rendering using logical &&] */}
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scheme.bg} ${scheme.text}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* [Requirement 7: Conditional Rendering of Icon] */}
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
        )}
      </div>

      {/* [Requirement 7: Conditional Rendering using ternary operator] */}
      {subtitle ? (
        <p className="mt-3 text-xs text-slate-500 font-medium flex items-center gap-1">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};


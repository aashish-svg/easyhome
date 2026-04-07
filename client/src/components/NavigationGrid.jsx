import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavigationGrid() {
    const navigate = useNavigate();

    const buttons = [
        { label: 'Milk Tracker', path: '/milk', icon: '🥛', color: 'bg-blue-100 text-blue-700' },
        { label: 'Expenses', path: '/expenses', icon: '₹', color: 'bg-green-100 text-green-700' },
        { label: 'Help / Maid', path: '/help', icon: '🧹', color: 'bg-purple-100 text-purple-700' },
        { label: 'Calendar', path: '/calendar', icon: '📅', color: 'bg-orange-100 text-orange-700' },
        { label: 'Udhaar', path: '/udhaar', icon: '🤝', color: 'bg-red-100 text-red-700' },
        { label: 'Fixed Bills', path: '/recurring', icon: '🔄', color: 'bg-teal-100 text-teal-700' },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {buttons.map((btn) => (
                <button
                    key={btn.path}
                    onClick={() => navigate(btn.path)}
                    className={`${btn.color} p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm active:scale-95 transition-transform border border-white`}
                >
                    <span className="text-4xl mb-3">{btn.icon}</span>
                    <span className="font-semibold text-sm tracking-wide">{btn.label}</span>
                </button>
            ))}
        </div>
    );
}
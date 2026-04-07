import React from 'react';

export default function BudgetTracker({ currentSpend, threshold }) {
    const percentage = Math.min((currentSpend / threshold) * 100, 100);
    const isOverBudget = percentage >= 90;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Monthly Spend</p>
                    <p className="text-3xl font-bold text-gray-800">₹{currentSpend.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-semibold text-gray-600">₹{threshold.toLocaleString()}</p>
                </div>
            </div>
            
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {isOverBudget && (
                <p className="text-xs text-red-600 mt-2 font-medium">Nearing monthly limit.</p>
            )}
        </div>
    );
}
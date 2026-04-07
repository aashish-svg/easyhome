import React from 'react';

export default function CalendarAlertBar() {
    const alerts = ["Electricity Bill Due Today"];

    if (alerts.length === 0) return null;

    return (
        <div className="bg-orange-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center">
            <span className="mr-2">[!]</span>
            {alerts[0]}
        </div>
    );
}
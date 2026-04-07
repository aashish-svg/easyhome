import React from 'react';

export default function AutocompleteInput({ label, value, onChange, options = [] }) {
    return (
        <div className="flex flex-col mb-4">
            <label className="text-sm text-gray-600 font-medium mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                list={`${label}-options`}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
            />
            <datalist id={`${label}-options`}>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt} />
                ))}
            </datalist>
        </div>
    );
}
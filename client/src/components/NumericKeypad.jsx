import React from 'react';

export default function NumericKeypad({ value, onChange }) {
    const handlePress = (num) => {
        if (num === 'C') {
            onChange('');
        } else if (num === 'DEL') {
            onChange(value.slice(0, -1));
        } else {
            onChange(value + num);
        }
    };

    const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

    return (
        <div className="grid grid-cols-3 gap-2 mt-4">
            {buttons.map((btn) => (
                <button
                    type="button"
                    key={btn}
                    onClick={() => handlePress(btn)}
                    className="bg-gray-100 p-4 text-xl font-semibold rounded-lg active:bg-gray-200 transition-colors"
                >
                    {btn}
                </button>
            ))}
        </div>
    );
}
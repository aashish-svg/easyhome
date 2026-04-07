import React from 'react';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">!</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="flex border-t border-slate-50">
                    <button 
                        onClick={onCancel}
                        className="flex-1 p-5 text-slate-400 font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 p-5 text-rose-600 font-bold hover:bg-rose-50 border-l border-slate-50 transition-colors uppercase tracking-widest text-xs"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState({ budget: 0, spent: 0, upcoming: [] });
    const [editBudget, setEditBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axiosInstance.get('/dashboard');
            setData(res.data);
            setBudgetInput(res.data.budget);
        } catch (err) {
            console.error("Dashboard fetch failed");
        }
    };

    const handleBudgetUpdate = async () => {
        if (!budgetInput || isNaN(budgetInput)) return;
        try {
            await axiosInstance.post('/dashboard/budget', { budget: budgetInput });
            setEditBudget(false);
            fetchDashboard();
        } catch (err) {
            console.error("Budget update failed");
        }
    };

    const balance = data.budget - data.spent;
    const balanceColor = balance < 0 ? 'text-rose-500' : 'text-emerald-500';

    return (
        <div className="flex flex-col h-screen bg-slate-100 w-full max-w-md mx-auto border-x border-slate-300 font-sans overflow-x-hidden">
            
            <div className="bg-slate-900 text-white p-6 shadow-md z-10">
                <h1 className="text-xl font-black uppercase tracking-[0.2em] mb-6">EasyHome</h1>
                
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Budget</p>
                            {editBudget ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={budgetInput} 
                                        onChange={(e) => setBudgetInput(e.target.value)}
                                        className="w-24 bg-slate-900 text-white font-bold px-2 py-1 outline-none border border-slate-600 rounded"
                                    />
                                    <button onClick={handleBudgetUpdate} className="text-[10px] bg-blue-600 px-2 py-1 rounded font-bold uppercase">Save</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-black">₹{parseFloat(data.budget).toLocaleString('en-IN')}</p>
                                    <button onClick={() => setEditBudget(true)} className="text-[10px] text-slate-400 border border-slate-600 px-2 py-0.5 rounded uppercase">Edit</button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Spent</p>
                            <p className="text-lg font-black text-white">₹{parseFloat(data.spent).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                            <p className={`text-lg font-black ${balanceColor}`}>₹{parseFloat(balance).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Notification Center (7 Days)</h2>
                    <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                        {data.upcoming.length === 0 ? (
                            <div className="p-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                No Upcoming Events or Payments
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {data.upcoming.map((item, idx) => {
                                    const isBill = item.type === 'Bill';
                                    const dayLabel = item.days_left === 0 ? 'TODAY' : item.days_left === 1 ? 'TOMORROW' : `${item.days_left} DAYS`;
                                    const bgLabel = item.days_left === 0 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700';

                                    return (
                                        <div key={idx} className="p-4 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${bgLabel}`}>
                                                        {dayLabel}
                                                    </span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest border px-1.5 py-0.5 rounded ${isBill ? 'border-rose-300 text-rose-600' : 'border-blue-300 text-blue-600'}`}>
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-black text-slate-900 uppercase">{item.title}</p>
                                            </div>
                                            {isBill && (
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-rose-600">₹{parseFloat(item.amount).toLocaleString('en-IN')}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Modules</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/expenses')} className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm text-left active:scale-95 transition-transform">
                            <span className="block text-2xl mb-2">₹</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Expenses</span>
                        </button>
                        <button onClick={() => navigate('/recurring')} className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm text-left active:scale-95 transition-transform">
                            <span className="block text-2xl mb-2">↻</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Fixed Bills</span>
                        </button>
                        <button onClick={() => navigate('/milk')} className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm text-left active:scale-95 transition-transform">
                            <span className="block text-2xl mb-2">🥛</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Milk Log</span>
                        </button>
                        <button onClick={() => navigate('/help')} className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm text-left active:scale-95 transition-transform">
                            <span className="block text-2xl mb-2">🧹</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Maid Log</span>
                        </button>
                        <button onClick={() => navigate('/calendar')} className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm text-left active:scale-95 transition-transform">
                            <span className="block text-2xl mb-2">📅</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Calendar</span>
                        </button>
                        <button onClick={() => navigate('/udhaar')} className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm text-left active:scale-95 transition-transform">
                            <span className="block text-2xl mb-2">🤝</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Udhaar</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
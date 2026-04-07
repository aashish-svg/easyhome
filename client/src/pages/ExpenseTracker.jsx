import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ExpenseTracker() {
    const navigate = useNavigate();
    const [view, setView] = useState('entry'); // 'entry' or 'logs'
    const [stats, setStats] = useState({ total: 0 });
    const [history, setHistory] = useState([]);
    const [modal, setModal] = useState({ open: false, id: null });

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Groceries');
    const [description, setDescription] = useState('');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const categories = [
        { id: 'Groceries', icon: '🛒' },
        { id: 'Bills & Utils', icon: '⚡' },
        { id: 'Transport', icon: '⛽' },
        { id: 'Health', icon: '💊' },
        { id: 'Shopping', icon: '🛍️' },
        { id: 'Others', icon: '📦' },
    ];

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axiosInstance.get('/expenses/dashboard');
            setStats({ total: res.data.total });
            setHistory(res.data.history);
        } catch (err) {
            console.error("Failed to fetch expenses.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount.");

        try {
            await axiosInstance.post('/expenses/log', { date, category, amount, description });
            setAmount('');
            setDescription('');
            fetchDashboard();
            setView('logs'); // Switch to logs after saving to see it instantly
        } catch (err) {
            alert("Failed to save expense.");
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/expenses/${modal.id}`);
            setModal({ open: false, id: null });
            fetchDashboard();
        } catch (err) {
            alert("Delete failed.");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 w-full max-w-md mx-auto border-x border-slate-300 font-sans overflow-x-hidden">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between sticky top-0 z-10 shadow-md">
                <button onClick={() => navigate('/')} className="text-white font-light text-2xl px-2">←</button>
                <h1 className="text-sm font-black uppercase tracking-widest flex-1 text-center">Expense Tracker</h1>
                <div className="w-8"></div>
            </div>

            {/* Total Spending Banner */}
            <div className="bg-slate-800 text-white p-6 text-center border-b-4 border-rose-500">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">
                    Total Spent • {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })}
                </p>
                <h2 className="text-4xl font-black">₹{parseFloat(stats.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            </div>

            {/* Toggle View */}
            <div className="bg-white p-3 shadow-sm border-b border-slate-200 z-10">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('entry')} 
                        className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all ${view === 'entry' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                        Add Expense
                    </button>
                    <button 
                        onClick={() => setView('logs')} 
                        className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all ${view === 'logs' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                        View Logs
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-6">
                
                {/* --- ADD EXPENSE FORM --- */}
                {view === 'entry' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-300">
                        
                        {/* Amount Input */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Amount (₹)</label>
                            <div className="flex items-center">
                                <span className="text-3xl font-black text-slate-400 mr-2">₹</span>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    placeholder="0.00"
                                    className="w-full text-4xl font-black text-slate-900 outline-none bg-transparent placeholder-slate-200" 
                                />
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Date</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                className="w-full p-4 bg-white border border-slate-200 shadow-sm rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-200" 
                            />
                        </div>

                        {/* Category Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Category</label>
                            <div className="grid grid-cols-3 gap-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`p-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                                            category === cat.id 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-[1.02]' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="text-2xl mb-1">{cat.icon}</span>
                                        <span className="text-[9px] font-bold uppercase">{cat.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Remark/Description */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Description (Optional)</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                placeholder="What was this for?"
                                rows="2"
                                className="w-full p-4 bg-white border border-slate-200 shadow-sm rounded-2xl font-medium text-slate-800 outline-none resize-none focus:ring-2 focus:ring-slate-200" 
                            />
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={!amount}
                            className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all"
                        >
                            Save Expense
                        </button>
                    </div>
                )}

                {/* --- EXPENSE LOGS VIEW --- */}
                {view === 'logs' && (
                    <div className="p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                        {history.length === 0 ? (
                            <div className="text-center py-10">
                                <span className="text-4xl block mb-2">💸</span>
                                <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">No expenses yet</p>
                            </div>
                        ) : (
                            history.map(item => {
                                const catObj = categories.find(c => c.id === item.category) || { icon: '📝' };
                                return (
                                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl border border-slate-100">
                                                {catObj.icon}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">₹{parseFloat(item.amount).toLocaleString('en-IN')}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        {item.category}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                                                        "{item.description}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setModal({ open: true, id: item.id })} 
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                        >
                                            <span className="text-lg">🗑️</span>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                        
                        {/* Summary Block at bottom of logs */}
                        {history.length > 0 && (
                            <div className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center">
                                <span className="text-xs font-black text-rose-800 uppercase tracking-widest">Total Listed</span>
                                <span className="text-xl font-black text-rose-600">₹{parseFloat(stats.total).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                    </div>
                )}

            </div>

            <ConfirmationModal 
                isOpen={modal.open} 
                title="Delete Expense?" 
                message="This will permanently remove the expense from your records." 
                onConfirm={handleDelete} 
                onCancel={() => setModal({ open: false, id: null })} 
            />
        </div>
    );
}
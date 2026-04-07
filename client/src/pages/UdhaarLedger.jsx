import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ConfirmationModal from '../components/ConfirmationModal';

export default function UdhaarLedger() {
    const navigate = useNavigate();
    const [view, setView] = useState('ledger');
    const [ledger, setLedger] = useState([]);
    const [summary, setSummary] = useState({ total_lent: 0, total_borrowed: 0, total_expense: 0 });
    const [modal, setModal] = useState({ open: false, id: null });

    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('LEND');
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [filterSource, setFilterSource] = useState('ALL');
    const [filterEntity, setFilterEntity] = useState('ALL');

    useEffect(() => { fetchLedger(); }, []);

    const fetchLedger = async () => {
        try {
            const res = await axiosInstance.get('/udhaar/dashboard');
            setLedger(res.data.ledger);
            setSummary(res.data.summary);
        } catch (err) {
            console.error("Ledger fetch failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!personName || !amount || parseFloat(amount) <= 0) return;

        try {
            await axiosInstance.post('/udhaar/log', { 
                person_name: personName, 
                transaction_type: transactionType, 
                amount, 
                reason, 
                date 
            });
            setPersonName('');
            setAmount('');
            setReason('');
            fetchLedger();
            setView('ledger');
        } catch (err) {
            console.error("Submit failed");
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/udhaar/${modal.id}`);
            setModal({ open: false, id: null });
            fetchLedger();
        } catch (err) {
            console.error("Delete failed");
        }
    };

    const uniqueEntities = useMemo(() => {
        const entities = new Set(ledger.map(item => item.entity));
        return Array.from(entities).sort();
    }, [ledger]);

    const filteredLedger = useMemo(() => {
        return ledger.filter(item => {
            const sourceMatch = filterSource === 'ALL' || item.source === filterSource;
            const entityMatch = filterEntity === 'ALL' || item.entity === filterEntity;
            return sourceMatch && entityMatch;
        });
    }, [ledger, filterSource, filterEntity]);

    const formatCurrency = (val) => parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    return (
        <div className="flex flex-col h-screen bg-slate-50 w-full max-w-md mx-auto border-x border-slate-300 font-sans overflow-x-hidden">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shadow-md z-10">
                <button onClick={() => navigate('/')} className="text-white font-light text-2xl px-2">←</button>
                <h1 className="text-sm font-black uppercase tracking-widest flex-1 text-center">Unified Ledger</h1>
                <div className="w-8"></div>
            </div>

            <div className="bg-white p-4 grid grid-cols-3 gap-2 border-b border-slate-200">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">To Receive</p>
                    <p className="text-sm font-black text-emerald-700">₹{formatCurrency(summary.total_lent)}</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-center">
                    <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider mb-1">To Pay</p>
                    <p className="text-sm font-black text-rose-700">₹{formatCurrency(summary.total_borrowed)}</p>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expenses</p>
                    <p className="text-sm font-black text-slate-800">₹{formatCurrency(summary.total_expense)}</p>
                </div>
            </div>

            <div className="bg-white p-3 shadow-sm border-b border-slate-200 z-10">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('ledger')} 
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${view === 'ledger' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                        Master Ledger
                    </button>
                    <button 
                        onClick={() => setView('entry')} 
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${view === 'entry' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                        Add Udhaar
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-6">
                
                {view === 'entry' && (
                    <div className="p-5 space-y-5">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Transaction Type</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setTransactionType('LEND')}
                                    className={`flex-1 py-3 text-xs font-black uppercase rounded-lg border ${transactionType === 'LEND' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                                >
                                    I Gave (Lend)
                                </button>
                                <button 
                                    onClick={() => setTransactionType('BORROW')}
                                    className={`flex-1 py-3 text-xs font-black uppercase rounded-lg border ${transactionType === 'BORROW' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                                >
                                    I Took (Borrow)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Person Name</label>
                            <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)} className="w-full p-4 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-slate-800 outline-none" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Amount (₹)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-slate-800 outline-none" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Reason / Description</label>
                            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-4 bg-white border border-slate-200 shadow-sm rounded-xl font-medium text-slate-800 outline-none" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-slate-800 outline-none" />
                        </div>

                        <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-md">
                            Save Record
                        </button>
                    </div>
                )}

                {view === 'ledger' && (
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <select 
                                value={filterSource} 
                                onChange={(e) => setFilterSource(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none uppercase tracking-wide"
                            >
                                <option value="ALL">All Sources</option>
                                <option value="Udhaar">Udhaar Only</option>
                                <option value="Milk">Milkman</option>
                                <option value="Maid">Maid</option>
                                <option value="Expense">Other Expenses</option>
                            </select>

                            <select 
                                value={filterEntity} 
                                onChange={(e) => setFilterEntity(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none uppercase tracking-wide"
                            >
                                <option value="ALL">All Persons/Categories</option>
                                {uniqueEntities.map(ent => <option key={ent} value={ent}>{ent}</option>)}
                            </select>
                        </div>

                        {filteredLedger.length === 0 ? (
                            <div className="p-5 text-center text-slate-400 font-bold text-xs uppercase">No records found</div>
                        ) : (
                            <div className="space-y-3">
                                {filteredLedger.map(item => {
                                    const isLend = item.transaction_type === 'LEND';
                                    const isBorrow = item.transaction_type === 'BORROW';
                                    const amountColor = isLend ? 'text-emerald-600' : isBorrow ? 'text-rose-600' : 'text-slate-800';
                                    const typeLabel = isLend ? 'Gave' : isBorrow ? 'Took' : 'Spent';

                                    return (
                                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-black text-slate-900 uppercase">{item.entity}</span>
                                                    <span className="text-[8px] font-black text-white bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.source}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">
                                                    {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                {item.description && <p className="text-xs font-medium text-slate-600">{item.description}</p>}
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className={`text-base font-black ${amountColor}`}>₹{formatCurrency(item.amount)}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{typeLabel}</p>
                                                {item.source === 'Udhaar' && (
                                                    <button 
                                                        onClick={() => setModal({ open: true, id: item.id })}
                                                        className="mt-2 text-[10px] font-bold text-rose-500 uppercase border border-rose-200 px-2 py-0.5 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmationModal 
                isOpen={modal.open} 
                title="Delete Entry?" 
                message="This action cannot be undone." 
                onConfirm={handleDelete} 
                onCancel={() => setModal({ open: false, id: null })} 
            />
        </div>
    );
}
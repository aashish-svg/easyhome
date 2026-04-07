import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ConfirmationModal from '../components/ConfirmationModal';

export default function MilkTracker() {
    const navigate = useNavigate();
    const [view, setView] = useState('entry');
    const [stats, setStats] = useState({ total_liters: 0, total_cost: 0, past_balance: 0 });
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [history, setHistory] = useState([]);
    const [entries, setEntries] = useState([{ milk_type: 'Cow Milk', rate: '', qty: '' }]);
    const [modal, setModal] = useState({ open: false, id: null });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axiosInstance.get('/milk/dashboard');
            if (res.data.summary) setStats(res.data.summary);
            if (res.data.history) setHistory(res.data.history);
        } catch (err) {
            console.error(err);
        }
    };

    const updateEntry = (index, field, value) => {
        const updated = [...entries];
        updated[index][field] = value;
        setEntries(updated);
    };

    const addMoreType = () => {
        if (entries.length < 2) {
            setEntries([...entries, { milk_type: 'Buffalo Milk', rate: '', qty: '' }]);
        }
    };

    const handleEdit = (item) => {
        const localDate = new Date(item.date).toLocaleDateString('en-CA');
        setDate(localDate);
        setEntries([{
            milk_type: item.milk_type,
            rate: item.rate_per_liter,
            qty: item.quantity_liters
        }]);
        setView('entry');
    };

    const handleSubmit = async () => {
        const valid = entries.filter(e => e.rate && e.qty && parseFloat(e.qty) > 0);
        if (valid.length === 0) return;

        try {
            await axiosInstance.post('/milk/log', { date, entries: valid });
            setEntries([{ milk_type: 'Cow Milk', rate: '', qty: '' }]);
            fetchDashboard();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/milk/${modal.id}`);
            setModal({ open: false, id: null });
            fetchDashboard();
        } catch (err) {
            console.error(err);
        }
    };

    const getCalendarCells = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let i = 1; i <= daysInMonth; i++) cells.push(i);
        return cells;
    };

    const getDayEntries = (day) => {
        if (!day) return [];
        const targetDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return history.filter(h => new Date(h.date).toLocaleDateString('en-CA') === targetDate);
    };

    const totalToPay = parseFloat(stats.total_cost || 0);
    const pastBalance = parseFloat(stats.past_balance || 0);
    const finalBalance = totalToPay + pastBalance;
    const cells = getCalendarCells();

    return (
        <div className="flex flex-col h-screen bg-slate-50 w-full max-w-md mx-auto border-x border-slate-300 font-sans overflow-x-hidden">
            
            <div className="bg-white p-4 flex items-center border-b border-slate-300 w-full">
                <button onClick={() => navigate('/')} className="text-slate-800 font-bold text-xl mr-4">←</button>
                <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-widest text-center flex-1">
                    {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto w-full">
                
                <div className="w-full bg-white p-2">
                    <div className="w-full grid grid-cols-7 border-t border-l border-slate-400">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="border-r border-b border-slate-400 bg-blue-800 text-white text-center py-2 text-[10px] font-bold uppercase">
                                {day}
                            </div>
                        ))}
                        
                        {cells.map((day, idx) => {
                            const entries = getDayEntries(day);
                            return (
                                <div key={idx} className="border-r border-b border-slate-400 min-h-[70px] bg-white p-1 flex flex-col justify-between">
                                    {day ? (
                                        <>
                                            <span className="text-[11px] font-bold text-slate-800">{day}</span>
                                            <div className="flex flex-col gap-1 w-full mt-1">
                                                {entries.map(e => (
                                                    <div 
                                                        key={e.id} 
                                                        className={`text-[9px] font-bold p-1 leading-tight text-center border rounded-sm
                                                            ${e.milk_type === 'Cow Milk' ? 'bg-yellow-100 text-yellow-900 border-yellow-300' : 'bg-green-100 text-green-900 border-green-300'}`}
                                                    >
                                                        {e.quantity_liters}L<br/>₹{Math.round(e.total_amount)}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-slate-100"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-y border-slate-300 bg-white mt-2 shadow-sm w-full">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-600 uppercase">Total to Pay this month</span>
                        <span className="text-sm font-black text-slate-900">₹{totalToPay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-600 uppercase">Total due/Advance past month</span>
                        <span className="text-sm font-black text-slate-900">₹{pastBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-black text-slate-900 uppercase">Balance</span>
                        <span className="text-lg font-black text-slate-900">₹{finalBalance.toFixed(2)}</span>
                    </div>
                </div>

                <div className="p-4 w-full">
                    <div className="flex bg-slate-200 p-1 rounded mb-4 w-full">
                        <button 
                            onClick={() => setView('entry')} 
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${view === 'entry' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                        >
                            Add Details
                        </button>
                        <button 
                            onClick={() => setView('logs')} 
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${view === 'logs' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                        >
                            View Logs
                        </button>
                    </div>

                    {view === 'entry' && (
                        <div className="space-y-4 w-full">
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-slate-300 rounded font-bold outline-none" />

                            {entries.map((entry, idx) => {
                                const lineTotal = (parseFloat(entry.rate || 0) * parseFloat(entry.qty || 0)).toFixed(2);
                                return (
                                    <div key={idx} className="p-4 border border-slate-300 rounded bg-white relative shadow-sm w-full">
                                        {idx > 0 && <button onClick={() => setEntries(entries.filter((_, i) => i !== idx))} className="absolute top-2 right-3 text-slate-400 font-bold text-lg">×</button>}
                                        
                                        <select 
                                            value={entry.milk_type} 
                                            onChange={(e) => updateEntry(idx, 'milk_type', e.target.value)}
                                            className="font-bold text-slate-900 text-sm uppercase outline-none bg-transparent w-full border-b border-slate-200 pb-2 mb-3"
                                        >
                                            <option value="Cow Milk">Cow Milk</option>
                                            <option value="Buffalo Milk">Buffalo Milk</option>
                                        </select>

                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div className="w-full">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Rate/L (₹)</label>
                                                <input type="number" value={entry.rate} onChange={(e) => updateEntry(idx, 'rate', e.target.value)} className="w-full p-2 border border-slate-300 rounded font-bold outline-none mt-1" />
                                            </div>
                                            <div className="w-full">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Quantity (L)</label>
                                                <input type="number" value={entry.qty} onChange={(e) => updateEntry(idx, 'qty', e.target.value)} className="w-full p-2 border border-slate-300 rounded font-bold outline-none mt-1" />
                                            </div>
                                        </div>
                                        <div className="text-right pt-3 mt-3 border-t border-slate-200">
                                            <span className="text-xs font-bold text-slate-500 uppercase mr-2">Total:</span>
                                            <span className="text-base font-black text-slate-900">₹{lineTotal}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {entries.length < 2 && (
                                <button onClick={addMoreType} className="w-full py-3 border border-slate-300 rounded text-slate-600 font-bold text-xs uppercase bg-slate-50">
                                    + Add Second Milk Type
                                </button>
                            )}

                            <button onClick={handleSubmit} className="w-full py-4 bg-blue-800 text-white rounded font-black text-sm uppercase tracking-widest shadow-md">
                                Save Entry
                            </button>
                        </div>
                    )}

                    {view === 'logs' && (
                        <div className="border border-slate-300 rounded overflow-hidden shadow-sm w-full">
                            <table className="w-full text-left border-collapse bg-white">
                                <thead>
                                    <tr className="bg-slate-100 border-b border-slate-300">
                                        <th className="p-3 text-[10px] font-bold text-slate-600 uppercase border-r border-slate-300">Date/Type</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-600 uppercase border-r border-slate-300">Details</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-600 uppercase text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-xs font-bold text-slate-500 uppercase">No Entries</td>
                                        </tr>
                                    )}
                                    {history.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-200 last:border-none">
                                            <td className="p-3 border-r border-slate-200 align-top w-2/5">
                                                <div className="text-xs font-black text-slate-900">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                                                <div className={`text-[10px] font-bold uppercase ${item.milk_type === 'Cow Milk' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {item.milk_type}
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-slate-200 align-top w-2/5">
                                                <div className="text-xs font-black text-slate-900">{item.quantity_liters}L @ ₹{item.rate_per_liter}</div>
                                                <div className="text-[10px] font-bold text-slate-500">Total: ₹{Math.round(item.total_amount)}</div>
                                            </td>
                                            <td className="p-3 align-middle text-center w-1/5 space-y-2">
                                                <button onClick={() => handleEdit(item)} className="block w-full border border-slate-300 text-slate-700 font-bold text-[10px] uppercase bg-slate-50 py-1 rounded">Edit</button>
                                                <button onClick={() => setModal({ open: true, id: item.id })} className="block w-full border border-red-300 text-red-700 font-bold text-[10px] uppercase bg-red-50 py-1 rounded">Del</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal 
                isOpen={modal.open} 
                title="Confirm Deletion" 
                message="Permanently remove this record?" 
                onConfirm={handleDelete} 
                onCancel={() => setModal({ open: false, id: null })} 
            />
        </div>
    );
}
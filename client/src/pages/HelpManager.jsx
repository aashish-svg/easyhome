import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function HelpManager() {
    const navigate = useNavigate();
    const [view, setView] = useState('dashboard');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [maids, setMaids] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [financials, setFinancials] = useState([]);
    const [formState, setFormState] = useState({});

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axiosInstance.get('/help/dashboard');
            setMaids(res.data.maids);
            setAttendance(res.data.attendance);
            setFinancials(res.data.financials);
            
            const activeMaids = res.data.maids.filter(m => m.is_active);
            const initialForm = {};
            activeMaids.forEach(m => initialForm[m.id] = '1');
            setFormState(initialForm);
        } catch (err) { console.error(err); }
    };

    const handleAddMaid = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        try {
            await axiosInstance.post('/help/maid', Object.fromEntries(data));
            setView('dashboard');
            fetchDashboard();
        } catch (err) { console.error(err); }
    };

    const handleRemoveMaid = async (id) => {
        if(!window.confirm('Remove this maid?')) return;
        try {
            await axiosInstance.put(`/help/maid/${id}/remove`);
            fetchDashboard();
        } catch (err) { console.error(err); }
    };

    const handleAttendanceSubmit = async () => {
        const entries = Object.keys(formState).map(maid_id => ({
            maid_id,
            status: formState[maid_id]
        }));
        try {
            await axiosInstance.post('/help/attendance', { date, entries });
            fetchDashboard();
        } catch (err) { console.error(err); }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        data.append('date', new Date().toISOString().split('T')[0]);
        try {
            await axiosInstance.post('/help/payment', Object.fromEntries(data));
            setView('dashboard');
            fetchDashboard();
        } catch (err) { console.error(err); }
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const formatStatus = (val) => {
        const v = parseFloat(val);
        if (v === 1) return '1';
        if (v === 0.5) return '1/2';
        if (v === 0.25) return '1/4';
        return 'A';
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
        return attendance.filter(a => new Date(a.date).toLocaleDateString('en-CA') === targetDate);
    };

    const calculateMonthlyStats = (maidId) => {
        const maid = maids.find(m => m.id === maidId);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyRate = parseFloat(maid.salary) / daysInMonth;
        
        const monthAtt = attendance.filter(a => a.maid_id === maidId);
        const presentDays = monthAtt.reduce((sum, a) => sum + parseFloat(a.status), 0);
        const amountToPay = presentDays * dailyRate;

        const fin = financials.find(f => f.maid_id === maidId) || { all_time_earned: 0, all_time_paid: 0 };
        const balance = parseFloat(fin.all_time_earned) - parseFloat(fin.all_time_paid);

        return { presentDays, amountToPay, balance };
    };

    const cells = getCalendarCells();
    const activeMaids = maids.filter(m => m.is_active);

    return (
        <div className="flex flex-col h-screen bg-slate-50 w-full max-w-md mx-auto border-x border-slate-300 font-sans overflow-x-hidden">
            
            <div className="bg-white p-4 flex items-center border-b border-slate-300 w-full sticky top-0 z-10">
                <button onClick={() => navigate('/')} className="text-slate-800 font-bold text-xl mr-4">←</button>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest flex-1 text-center">Help Manager</h1>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-24">
                
                {view === 'dashboard' && (
                    <>
                        <div className="w-full bg-white p-2">
                            <h2 className="text-center font-bold text-slate-800 uppercase tracking-widest text-sm py-2">
                                {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="w-full grid grid-cols-7 border-t border-l border-slate-400">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="border-r border-b border-slate-400 bg-slate-800 text-white text-center py-2 text-[10px] font-bold uppercase">
                                        {day}
                                    </div>
                                ))}
                                
                                {cells.map((day, idx) => {
                                    const entries = getDayEntries(day);
                                    return (
                                        <div key={idx} className="border-r border-b border-slate-400 min-h-[60px] bg-white p-1 flex flex-col justify-between">
                                            {day ? (
                                                <>
                                                    <span className="text-[10px] font-bold text-slate-800">{day}</span>
                                                    <div className="flex flex-col gap-0.5 w-full mt-1">
                                                        {entries.map(e => {
                                                            const maid = maids.find(m => m.id === e.maid_id);
                                                            if(!maid) return null;
                                                            const statusStr = formatStatus(e.status);
                                                            return (
                                                                <div key={e.id} className={`text-[8px] font-black px-1 py-0.5 text-center border rounded-sm ${statusStr === 'A' ? 'bg-red-100 text-red-900 border-red-300' : 'bg-blue-100 text-blue-900 border-blue-300'}`}>
                                                                    {getInitials(maid.name)} - {statusStr}
                                                                </div>
                                                            );
                                                        })}
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

                        <div className="p-4 space-y-4">
                            {maids.map(maid => {
                                const stats = calculateMonthlyStats(maid.id);
                                // Hide inactive maids if they have no presence this month
                                if (!maid.is_active && stats.presentDays === 0) return null;

                                return (
                                    <div key={maid.id} className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm relative">
                                        {maid.is_active && (
                                            <button onClick={() => handleRemoveMaid(maid.id)} className="absolute top-4 right-4 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded uppercase">Remove</button>
                                        )}
                                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">
                                            {maid.name} {!maid.is_active && <span className="text-[10px] text-red-500 ml-2">(Inactive)</span>}
                                        </h3>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>Present Days:</span>
                                                <span className="text-slate-900">{stats.presentDays}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>Earned This Month:</span>
                                                <span className="text-slate-900">₹{stats.amountToPay.toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100 mt-2">
                                                <span className="uppercase">Overall Balance:</span>
                                                <span className={stats.balance >= 0 ? 'text-red-600' : 'text-green-600'}>
                                                    ₹{stats.balance.toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {activeMaids.length > 0 && (
                            <div className="bg-white border-y border-slate-300 p-4 space-y-4">
                                <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">Log Daily Attendance</h3>
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded font-bold outline-none text-sm" />
                                
                                {activeMaids.map(maid => (
                                    <div key={maid.id} className="flex flex-col space-y-2 border-b border-slate-100 pb-3">
                                        <span className="font-bold text-xs text-slate-700 uppercase">{maid.name}</span>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['A', '1/4', '1/2', '1'].map(val => {
                                                const numericVal = val === 'A' ? '0' : val === '1/4' ? '0.25' : val === '1/2' ? '0.5' : '1';
                                                const isSelected = formState[maid.id] === numericVal;
                                                return (
                                                    <button 
                                                        key={val}
                                                        onClick={() => setFormState({...formState, [maid.id]: numericVal})}
                                                        className={`py-2 text-xs font-black rounded border transition-colors ${isSelected ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-300'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleAttendanceSubmit} className="w-full py-3 bg-slate-900 text-white rounded font-black text-xs uppercase tracking-widest mt-2">Submit Attendance</button>
                            </div>
                        )}
                    </>
                )}

                {view === 'add-maid' && (
                    <div className="p-4">
                        <h2 className="font-black text-lg text-slate-900 uppercase tracking-widest mb-4">Add New Maid</h2>
                        <form onSubmit={handleAddMaid} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Name</label>
                                <input type="text" name="name" required className="w-full p-3 border border-slate-300 rounded font-bold outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Salary Per Month (₹)</label>
                                <input type="number" name="salary" required className="w-full p-3 border border-slate-300 rounded font-bold outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Starting Date</label>
                                <input type="date" name="start_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-slate-300 rounded font-bold outline-none" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded font-black text-sm uppercase tracking-widest">Save Maid</button>
                            <button type="button" onClick={() => setView('dashboard')} className="w-full py-3 bg-slate-200 text-slate-700 rounded font-bold text-xs uppercase tracking-widest">Cancel</button>
                        </form>
                    </div>
                )}

                {view === 'payment' && (
                    <div className="p-4">
                        <h2 className="font-black text-lg text-slate-900 uppercase tracking-widest mb-4">Make Payment</h2>
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Select Maid</label>
                                <select name="maid_id" required className="w-full p-3 border border-slate-300 rounded font-bold outline-none bg-white">
                                    {activeMaids.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Amount (₹)</label>
                                <input type="number" name="amount" required className="w-full p-3 border border-slate-300 rounded font-bold outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Remark</label>
                                <input type="text" name="remark" placeholder="e.g. March Salary" className="w-full p-3 border border-slate-300 rounded font-bold outline-none" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded font-black text-sm uppercase tracking-widest">Submit Payment</button>
                            <button type="button" onClick={() => setView('dashboard')} className="w-full py-3 bg-slate-200 text-slate-700 rounded font-bold text-xs uppercase tracking-widest">Cancel</button>
                        </form>
                    </div>
                )}
            </div>

            {view === 'dashboard' && (
                <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-300 p-3 flex gap-2">
                    <button onClick={() => setView('add-maid')} className="flex-1 py-3 border border-slate-800 text-slate-800 rounded font-black text-xs uppercase tracking-widest bg-slate-50">+ Add Maid</button>
                    <button onClick={() => setView('payment')} className="flex-1 py-3 bg-slate-900 text-white rounded font-black text-xs uppercase tracking-widest">Payment</button>
                </div>
            )}
        </div>
    );
}
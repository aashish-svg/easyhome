import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ConfirmationModal from '../components/ConfirmationModal';

export default function RecurringPayments() {
    const navigate = useNavigate();
    const [view, setView] = useState('dashboard'); // dashboard, calendar, add
    const [calendarMode, setCalendarMode] = useState('month'); // month, year
    const [viewDate, setViewDate] = useState(new Date());
    
    const [schedules, setSchedules] = useState([]);
    const [payments, setPayments] = useState([]);
    const [modal, setModal] = useState({ open: false, id: null });

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('EMI');
    const [totalAmount, setTotalAmount] = useState('');
    const [installmentAmount, setInstallmentAmount] = useState('');
    const [intervalType, setIntervalType] = useState('Monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const categories = ['EMI', 'Loan', 'Insurance', 'Subscription', 'Other'];
    const intervals = ['Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axiosInstance.get('/recurring/dashboard');
            setSchedules(res.data.schedules);
            setPayments(res.data.payments);
        } catch (err) {
            console.error("Fetch failed");
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/recurring/schedule', {
                name, category, total_amount: totalAmount, installment_amount: installmentAmount, 
                interval_type: intervalType, start_date: startDate
            });
            setName(''); setTotalAmount(''); setInstallmentAmount('');
            fetchDashboard();
            setView('dashboard');
        } catch (err) { alert("Failed to add"); }
    };

    const handlePay = async (schedule_id, due_date, amount) => {
        try {
            await axiosInstance.post('/recurring/pay', {
                schedule_id, due_date, amount_paid: amount, paid_on: new Date().toISOString().split('T')[0]
            });
            fetchDashboard();
        } catch (err) { alert("Failed to log payment"); }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/recurring/${modal.id}`);
            setModal({ open: false, id: null });
            fetchDashboard();
        } catch (err) { alert("Delete failed"); }
    };

    // Core Logic: Generate all instances
    const allInstallments = useMemo(() => {
        let items = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        schedules.forEach(sch => {
            const total = parseFloat(sch.total_amount);
            const instAmt = parseFloat(sch.installment_amount);
            const count = Math.ceil(total / instAmt);
            
            for (let i = 0; i < count; i++) {
                let d = new Date(sch.start_date);
                if(sch.interval_type === 'Weekly') d.setDate(d.getDate() + 7 * i);
                else if(sch.interval_type === 'Monthly') d.setMonth(d.getMonth() + 1 * i);
                else if(sch.interval_type === 'Quarterly') d.setMonth(d.getMonth() + 3 * i);
                else if(sch.interval_type === 'Half-Yearly') d.setMonth(d.getMonth() + 6 * i);
                else if(sch.interval_type === 'Yearly') d.setFullYear(d.getFullYear() + 1 * i);
                
                const dueDateStr = d.toISOString().split('T')[0];
                const isPaid = payments.some(p => p.schedule_id === sch.id && new Date(p.due_date).toISOString().split('T')[0] === dueDateStr);
                
                let status = 'Upcoming';
                let daysMissed = 0;
                
                if (isPaid) status = 'Paid';
                else if (d < today) {
                    status = 'Missed';
                    daysMissed = Math.floor((today - d) / (1000 * 60 * 60 * 24));
                }

                items.push({
                    id: `${sch.id}-${i}`,
                    schedule_id: sch.id,
                    name: sch.name,
                    category: sch.category,
                    amount: i === count - 1 ? (total - (instAmt * i)) : instAmt, // Handle last uneven installment
                    dueDate: d,
                    dueDateStr: dueDateStr,
                    status,
                    daysMissed
                });
            }
        });
        return items.sort((a, b) => a.dueDate - b.dueDate);
    }, [schedules, payments]);

    const missed = allInstallments.filter(i => i.status === 'Missed');
    const upcoming = allInstallments.filter(i => i.status === 'Upcoming' && i.dueDate <= new Date(new Date().setDate(new Date().getDate() + 30)));
    const thisMonthDue = allInstallments.filter(i => i.status === 'Upcoming' && i.dueDate.getMonth() === new Date().getMonth() && i.dueDate.getFullYear() === new Date().getFullYear())
                                         .reduce((sum, i) => sum + i.amount, 0);

    const getCalendarMonthCells = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let i = 1; i <= daysInMonth; i++) cells.push(i);
        return cells;
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 w-full max-w-md mx-auto border-x border-slate-300 font-sans overflow-x-hidden">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shadow-md z-10">
                <button onClick={() => navigate('/')} className="text-white font-light text-2xl px-2">←</button>
                <h1 className="text-[11px] font-black uppercase tracking-widest flex-1 text-center">Fixed Obligations</h1>
                <div className="w-8"></div>
            </div>

            <div className="bg-white p-3 shadow-sm border-b border-slate-200 z-10">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setView('dashboard')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${view === 'dashboard' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Overview</button>
                    <button onClick={() => setView('calendar')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${view === 'calendar' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Calendar</button>
                    <button onClick={() => setView('add')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${view === 'add' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>+ Add</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-6">
                
                {view === 'dashboard' && (
                    <div className="p-4 space-y-6">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Due This Month</p>
                            <p className="text-3xl font-black text-slate-900">₹{thisMonthDue.toLocaleString('en-IN')}</p>
                        </div>

                        {missed.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3">⚠️ Missed Payments</h3>
                                <div className="space-y-3">
                                    {missed.map(item => (
                                        <div key={item.id} className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-rose-900 text-sm uppercase">{item.name}</p>
                                                <p className="text-[10px] font-bold text-rose-600 mt-1">Missed by {item.daysMissed} days</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-rose-700 text-base mb-2">₹{item.amount.toLocaleString('en-IN')}</p>
                                                <button onClick={() => handlePay(item.schedule_id, item.dueDateStr, item.amount)} className="text-[10px] font-black text-white bg-rose-600 px-3 py-1.5 rounded uppercase tracking-wider">Pay Now</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Upcoming (30 Days)</h3>
                            {upcoming.length === 0 ? <p className="text-xs font-bold text-slate-400">No upcoming payments.</p> : (
                                <div className="space-y-3">
                                    {upcoming.map(item => (
                                        <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                                            <div>
                                                <div className="flex gap-2 items-center mb-1">
                                                    <p className="font-black text-slate-900 text-sm uppercase">{item.name}</p>
                                                    <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{item.category}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1">Due: {item.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-800 text-base mb-2">₹{item.amount.toLocaleString('en-IN')}</p>
                                                <button onClick={() => handlePay(item.schedule_id, item.dueDateStr, item.amount)} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded uppercase tracking-wider">Mark Paid</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-t border-slate-200 pt-6">Active Schedules (Settings)</h3>
                            <div className="space-y-3">
                                {schedules.map(sch => (
                                    <div key={sch.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="font-black text-slate-700 text-xs uppercase">{sch.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1">{sch.interval_type} • ₹{parseFloat(sch.installment_amount).toLocaleString('en-IN')}</p>
                                        </div>
                                        <button onClick={() => setModal({ open: true, id: sch.id })} className="text-[10px] font-black text-rose-500 uppercase">Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'calendar' && (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4 bg-white p-2 rounded-lg border border-slate-200">
                            <button onClick={() => {
                                const d = new Date(viewDate);
                                calendarMode === 'month' ? d.setMonth(d.getMonth() - 1) : d.setFullYear(d.getFullYear() - 1);
                                setViewDate(d);
                            }} className="px-3 py-1 bg-slate-100 font-bold rounded">◀</button>
                            
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                {calendarMode === 'month' 
                                    ? viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                                    : viewDate.getFullYear()}
                            </h2>
                            
                            <button onClick={() => {
                                const d = new Date(viewDate);
                                calendarMode === 'month' ? d.setMonth(d.getMonth() + 1) : d.setFullYear(d.getFullYear() + 1);
                                setViewDate(d);
                            }} className="px-3 py-1 bg-slate-100 font-bold rounded">▶</button>
                        </div>

                        <div className="flex bg-slate-200 p-1 rounded-lg mb-4 w-1/2 mx-auto">
                            <button onClick={() => setCalendarMode('month')} className={`flex-1 py-1 text-[9px] font-black uppercase rounded ${calendarMode === 'month' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Month</button>
                            <button onClick={() => setCalendarMode('year')} className={`flex-1 py-1 text-[9px] font-black uppercase rounded ${calendarMode === 'year' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Year</button>
                        </div>

                        {calendarMode === 'month' ? (
                            <div className="grid grid-cols-7 gap-1">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase py-1">{day}</div>
                                ))}
                                
                                {getCalendarMonthCells().map((day, idx) => {
                                    if (!day) return <div key={idx} className="bg-transparent min-h-[60px]"></div>;
                                    
                                    const cellDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const dayItems = allInstallments.filter(i => i.dueDateStr === cellDateStr);

                                    return (
                                        <div key={idx} className="bg-white min-h-[60px] border border-slate-200 rounded p-1 flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-800 mb-1">{day}</span>
                                            <div className="flex flex-col gap-0.5 mt-auto">
                                                {dayItems.map(item => (
                                                    <div key={item.id} className={`text-[8px] font-black px-1 py-0.5 rounded text-center truncate ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Missed' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        ₹{item.amount}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({length: 12}).map((_, i) => {
                                    const monthItems = allInstallments.filter(item => item.dueDate.getFullYear() === viewDate.getFullYear() && item.dueDate.getMonth() === i);
                                    const totalDue = monthItems.reduce((sum, item) => sum + item.amount, 0);
                                    const allPaid = monthItems.length > 0 && monthItems.every(item => item.status === 'Paid');

                                    return (
                                        <div key={i} className={`p-3 rounded-xl border flex flex-col justify-center items-center h-24 ${totalDue > 0 ? (allPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 shadow-sm') : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                            <span className="text-[10px] font-black uppercase text-slate-500 mb-1">{new Date(2000, i).toLocaleString('default', { month: 'short' })}</span>
                                            <span className={`text-sm font-black ${totalDue > 0 ? (allPaid ? 'text-emerald-700' : 'text-slate-900') : 'text-slate-400'}`}>
                                                ₹{totalDue.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {view === 'add' && (
                    <form onSubmit={handleAddSchedule} className="p-6 space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Bill / Loan Name</label>
                            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required placeholder="e.g. iPhone EMI" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                                <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Interval</label>
                                <select value={intervalType} onChange={(e)=>setIntervalType(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none">
                                    {intervals.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Amount (₹)</label>
                                <input type="number" value={totalAmount} onChange={(e)=>setTotalAmount(e.target.value)} required placeholder="Total Principal" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Periodic Amount (₹)</label>
                                <input type="number" value={installmentAmount} onChange={(e)=>setInstallmentAmount(e.target.value)} required placeholder="Installment" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">First Payment Date</label>
                            <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} required className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none" />
                        </div>

                        <button type="submit" className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-lg">
                            Create Schedule
                        </button>
                    </form>
                )}

            </div>

            <ConfirmationModal 
                isOpen={modal.open} 
                title="Delete Schedule?" 
                message="This will remove the schedule and all its virtual upcoming payments." 
                onConfirm={handleDelete} 
                onCancel={() => setModal({ open: false, id: null })} 
            />
        </div>
    );
}
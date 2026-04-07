import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ConfirmationModal from '../components/ConfirmationModal';

export default function UnifiedCalendar() {
    const navigate = useNavigate();
    
    const todayStr = new Date().toLocaleDateString('en-CA');
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [viewMonth, setViewMonth] = useState(new Date());
    
    const [events, setEvents] = useState([]);
    const [eventType, setEventType] = useState('Electricity Bill');
    const [customText, setCustomText] = useState('');
    const [modal, setModal] = useState({ open: false, id: null });

    const predefinedOptions = [
        'Electricity Bill', 
        'Water Bill', 
        'School Fee', 
        'House Rent', 
        'Maintenance', 
        'Other'
    ];

    useEffect(() => { 
        fetchEvents(); 
    }, [viewMonth]);

    const fetchEvents = async () => {
        const monthStr = viewMonth.toLocaleDateString('en-CA').slice(0, 7);
        try {
            const res = await axiosInstance.get(`/calendar/dashboard?month=${monthStr}`);
            setEvents(res.data);
        } catch (err) {
            console.error("Fetch failed");
        }
    };

    const handleSubmit = async () => {
        if (eventType === 'Other' && !customText.trim()) return alert("Enter event description");
        
        try {
            await axiosInstance.post('/calendar/log', { 
                date: selectedDate, 
                event_type: eventType,
                description: eventType === 'Other' ? customText : ''
            });
            setCustomText('');
            setEventType('Electricity Bill');
            fetchEvents();
        } catch (err) {
            console.error("Submit failed");
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/calendar/${modal.id}`);
            setModal({ open: false, id: null });
            fetchEvents();
        } catch (err) {
            console.error("Delete failed");
        }
    };

    const handlePrevMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
    };

    const getCalendarCells = () => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let i = 1; i <= daysInMonth; i++) cells.push(i);
        return cells;
    };

    const getEventsForDate = (dateString) => {
        return events.filter(e => new Date(e.date).toLocaleDateString('en-CA') === dateString);
    };

    const cells = getCalendarCells();
    const selectedDateEvents = getEventsForDate(selectedDate);
    const selectedDateObj = new Date(selectedDate);

    return (
        <div className="flex flex-col h-screen bg-slate-50 w-full max-w-md mx-auto border-x border-slate-300 font-sans overflow-x-hidden">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shadow-md z-10">
                <button onClick={() => navigate('/')} className="text-white font-light text-2xl px-2">←</button>
                <h1 className="text-sm font-black uppercase tracking-widest flex-1 text-center">Calendar Ledger</h1>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-6">
                
                <div className="bg-white p-4 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePrevMonth} className="px-3 py-1 bg-slate-100 font-bold rounded">◀</button>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
                            {viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth} className="px-3 py-1 bg-slate-100 font-bold rounded">▶</button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase py-1">
                                {day}
                            </div>
                        ))}
                        
                        {cells.map((day, idx) => {
                            if (!day) return <div key={idx} className="aspect-square bg-transparent"></div>;
                            
                            const cellDateStr = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayEvents = getEventsForDate(cellDateStr);
                            const isSelected = selectedDate === cellDateStr;
                            const isToday = todayStr === cellDateStr;

                            return (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedDate(cellDateStr)}
                                    className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-lg border transition-all ${
                                        isSelected 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                        : isToday 
                                            ? 'bg-blue-50 text-blue-900 border-blue-200' 
                                            : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-xs font-bold">{day}</span>
                                    <div className="flex gap-0.5 mt-1">
                                        {dayEvents.slice(0, 3).map((e, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></div>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-5">
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Events for {selectedDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </h3>
                        
                        {selectedDateEvents.length === 0 ? (
                            <div className="p-4 bg-slate-100 rounded-xl text-center border border-slate-200 text-slate-400 text-xs font-bold uppercase">
                                No events logged
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedDateEvents.map(event => (
                                    <div key={event.id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-wide">{event.event_type}</p>
                                            {event.description && <p className="text-xs font-bold text-slate-500 mt-0.5">{event.description}</p>}
                                        </div>
                                        <button 
                                            onClick={() => setModal({ open: true, id: event.id })}
                                            className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-full font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Add Event</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {predefinedOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setEventType(opt)}
                                    className={`px-3 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                                        eventType === opt 
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {eventType === 'Other' && (
                            <div className="mb-4">
                                <input 
                                    type="text" 
                                    value={customText} 
                                    onChange={(e) => setCustomText(e.target.value)} 
                                    placeholder="Specify event..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-slate-400" 
                                />
                            </div>
                        )}

                        <button 
                            onClick={handleSubmit} 
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-md active:scale-95 transition-transform"
                        >
                            Save Event
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={modal.open} 
                title="Remove Event?" 
                message="This event will be deleted from the calendar." 
                onConfirm={handleDelete} 
                onCancel={() => setModal({ open: false, id: null })} 
            />
        </div>
    );
}
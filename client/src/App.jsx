import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import MilkTracker from './pages/MilkTracker';
import HelpManager from './pages/HelpManager';
import UnifiedCalendar from './pages/UnifiedCalendar';
import UdhaarLedger from './pages/UdhaarLedger';
import RecurringPayments from './pages/RecurringPayments';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Dashboard />,
        },
        {
            path: '/expenses',
            element: <ExpenseTracker />,
        },
        {
            path: '/milk',
            element: <MilkTracker />,
        },
        {
            path: '/help',
            element: <HelpManager />,
        },
        {
            path: '/calendar',
            element: <UnifiedCalendar />,
        },
        {
            path: '/udhaar',
            element: <UdhaarLedger />,
        },
        {
            path: '/recurring',
            element: <RecurringPayments />,
        },
    ],
    {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
            v7_fetcherPersist: true,
            v7_normalizeFormMethod: true,
            v7_partialHydration: true,
            v7_skipActionErrorRevalidation: true,
        },
    }
);

function App() {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl overflow-hidden flex flex-col">
                <RouterProvider 
                    router={router} 
                    future={{ v7_startTransition: true }} 
                />
            </div>
        </div>
    );
}

export default App;
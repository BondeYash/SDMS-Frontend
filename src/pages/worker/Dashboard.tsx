import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Calendar, IndianRupee, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { productionService } from '../../services/apiServices';
import type { MonthlyEarnings, ProductionEntry } from '../../types/models';

// Inline mini production form
import ProductionEntryForm from './ProductionEntryForm';

const WorkerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [todayEntry, setTodayEntry] = useState<ProductionEntry | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyEarnings | null>(null);

    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const [year, month] = today.split('-');

            const [entryRes, statsRes] = await Promise.all([
                productionService.checkDateEntry(user.id, today).catch(() => null),
                productionService.getMonthlyEarnings(user.id, `${year}-${month}`).catch(() => null)
            ]);

            console.log(`[Dashboard] Date: ${today}, Entry Found:`, entryRes ? "Yes" : "No");
            if (entryRes) console.log(`[Dashboard] Entry Date:`, entryRes.productionDate);

            setTodayEntry(entryRes);
            setMonthlyStats(statsRes);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchDashboardData();
    }, [user]);

    if (isLoading) return <Loader fullScreen />;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
        <div className="space-y-6 pb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">👋 Welcome, {user?.name ? user.name.split(' ')[0] : 'User'}!</h1>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Calendar size={16} className="mr-1" /> {formattedDate}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 dark:text-red-400">
                    Logout
                </Button>
            </div>

            {/* Today's Status */}
            {todayEntry ? (
                <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
                            <CheckCircle size={28} />
                        </div>
                        <h2 className="text-lg font-bold text-green-800 dark:text-green-300">Production Submitted Today ✓</h2>
                        <p className="text-green-700 dark:text-green-200 text-sm">
                            You produced <strong>{todayEntry?.totalSheets ?? 0}</strong> sheets,
                            earning <strong>₹{Number(todayEntry?.totalEarnings ?? 0).toFixed(2)}</strong>.
                        </p>
                        <Button className="mt-2" variant="outline" onClick={() => navigate('/history')}>
                            View Entry Details
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                /* Inline Production Entry Form — shown by default */
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">📋 Today's Production Entry</h2>
                    <ProductionEntryForm
                        inlineDashboard
                        onSubmitSuccess={() => fetchDashboardData()}
                    />
                </div>
            )}

            {/* Monthly Summary */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">This Month Summary</h2>
                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <FileText className="text-blue-500 mb-2" size={24} />
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{monthlyStats?.totalSheets ?? 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Sheets</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <IndianRupee className="text-green-500 mb-2" size={24} />
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                ₹{Number(monthlyStats?.totalEarnings ?? 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Earnings</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Clock className="text-orange-500 mb-2" size={24} />
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{monthlyStats?.workingDays ?? 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Days</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Links */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Links</h2>
                <Card>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <Link to="/earnings" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <span className="font-medium text-gray-700 dark:text-gray-300">View Monthly Earnings</span>
                            <ArrowRight size={18} className="text-gray-400 dark:text-gray-500" />
                        </Link>
                        <Link to="/history" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Entry History</span>
                            <ArrowRight size={18} className="text-gray-400 dark:text-gray-500" />
                        </Link>
                        <Link to="/profile" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <span className="font-medium text-gray-700 dark:text-gray-300">My Profile</span>
                            <ArrowRight size={18} className="text-gray-400 dark:text-gray-500" />
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WorkerDashboard;

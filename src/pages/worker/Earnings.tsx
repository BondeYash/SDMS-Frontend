import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productionService } from '../../services/apiServices';
import type { MonthlyEarnings } from '../../types/models';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Input } from '../../components/ui/Input';
import { Calendar, FileText, IndianRupee, Clock } from 'lucide-react';

const WorkerEarnings: React.FC = () => {
    const { user } = useAuth();

    // Format current month specifically for input[type="month"]
    const currentEnvMonth = new Date().toISOString().substring(0, 7);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentEnvMonth);
    const [stats, setStats] = useState<MonthlyEarnings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;

        const fetchMonthly = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await productionService.getMonthlyEarnings(user.id, selectedMonth);
                setStats(data);
            } catch (err: any) {
                if (err.response?.status === 404 || err.response?.status === 400) {
                    // No data for this month or invalid format
                    setStats(null);
                } else {
                    console.error("Failed to load earnings", err);
                    setError("Failed to load earnings data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchMonthly();
    }, [user, selectedMonth]);

    const monthDisplay = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Monthly Earnings</h1>
                <div className="w-48">
                    <Input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="cursor-pointer"
                    />
                </div>
            </div>

            {isLoading ? (
                <Loader fullScreen />
            ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
            ) : !stats || stats.totalSheets === 0 ? (
                <Card className="bg-gray-50 border-dashed border-2">
                    <CardContent className="p-8 text-center text-gray-500">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No activity in {monthDisplay}</p>
                        <p className="text-sm">You haven't submitted any production for this month yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
                            <CardContent className="p-5 flex flex-col justify-center h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-green-100 font-medium text-sm">Earnings</p>
                                    <IndianRupee size={20} className="text-green-200" />
                                </div>
                                <h2 className="text-3xl font-bold">₹{Number(stats.totalEarnings).toFixed(2)}</h2>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-5 flex flex-col justify-center h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-500 font-medium text-sm">Total Sheets</p>
                                    <FileText size={20} className="text-blue-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">{stats.totalSheets}</h2>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-5 flex flex-col justify-center h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-500 font-medium text-sm">Working Days</p>
                                    <Calendar size={20} className="text-orange-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">{stats.workingDays}</h2>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-5 flex flex-col justify-center h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-500 font-medium text-sm">Daily Avg</p>
                                    <Clock size={20} className="text-purple-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">₹{Number(stats.averagePerDay).toFixed(2)}</h2>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Breakdown */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Daily Breakdown</h3>
                        <Card>
                            <div className="divide-y divide-gray-100">
                                {stats.dailyBreakdown.map((day, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(day.date).toLocaleDateString('en-IN', {
                                                    weekday: 'short', day: 'numeric', month: 'short'
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-500">{day.sheets} sheets</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">₹{Number(day.earnings).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerEarnings;

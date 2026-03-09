import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { workerService, sheetTypeService } from '../../services/apiServices';
import { Users, FileText, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalWorkers: 0,
        activeWorkers: 0,
        totalSheetTypes: 0,
        activeSheetTypes: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [workers, sheets] = await Promise.all([
                    workerService.getAll(),
                    sheetTypeService.getActive()
                ]);

                setStats({
                    totalWorkers: workers.length,
                    activeWorkers: workers.filter(w => w.isActive).length,
                    totalSheetTypes: sheets.length,
                    activeSheetTypes: sheets.length, // getActive returns active ones
                });
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return <Loader fullScreen />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">System overview and statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Workers</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.activeWorkers}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full text-green-600 dark:text-green-400">
                            <FileText size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sheet Types</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.activeSheetTypes}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full text-purple-600 dark:text-purple-400">
                            <Activity size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">Online</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart mock or actual usage summary could go here later */}
        </div>
    );
};

export default AdminDashboard;

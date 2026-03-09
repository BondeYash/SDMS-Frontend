import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { FileBarChart, Users, IndianRupee, ChevronDown } from 'lucide-react';
import { productionService, workerService } from '../../services/apiServices';
import type { WorkerMonthlyReport, Worker } from '../../types/models';

const AdminReports: React.FC = () => {
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [reports, setReports] = useState<WorkerMonthlyReport[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch workers on mount (filter out admins)
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const data = await workerService.getAll();
                // Filter to show only workers, not admins
                const workersOnly = data.filter(w => w.role === 'worker');
                console.log("Fetched workers for dropdown:", workersOnly);
                setWorkers(workersOnly);
            } catch (err) {
                console.error("Failed to fetch workers", err);
            }
        };
        fetchWorkers();
    }, []);

    const fetchReport = async () => {
        setIsLoading(true);
        setHasFetched(true);
        try {
            const [year, month] = selectedMonth.split('-').map(Number);
            const data = await productionService.getMonthlyAll(year, month);
            console.log("Monthly All Reports received:", data);
            if (Array.isArray(data)) {
                setReports(data);
            } else {
                console.warn("Expected array for reports but got:", data);
                setReports([]);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch on mount for current month
    useEffect(() => { fetchReport(); }, []);

    // Defensive check to prevent crash if backend returns non-array
    const reportsList = Array.isArray(reports) ? reports : [];

    // Filter reports if a worker is selected
    const filteredReports = selectedWorker
        ? reportsList.filter(r => r.workerId === selectedWorker)
        : reportsList;

    const totalSheets = filteredReports.reduce((s, r) => s + (Number(r.totalSheets) || 0), 0);
    const totalPayout = filteredReports.reduce((s, r) => s + (Number(r.totalEarnings) || 0), 0);
    const monthDisplay = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const selectedWorkerName = selectedWorker
        ? workers.find(w => w.id === selectedWorker)?.name || 'Unknown'
        : 'All Workers';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">System Reports</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monthly production & earnings summary.</p>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto flex-wrap gap-2">
                    <Input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="cursor-pointer"
                    />
                    <Button variant="outline" onClick={fetchReport} className="whitespace-nowrap">
                        Load Report
                    </Button>
                </div>
            </div>

            {/* Worker Selector Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left text-gray-700 dark:text-gray-300 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <span>👤 {selectedWorkerName}</span>
                    <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && workers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 sm:w-64 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                        <button
                            onClick={() => {
                                setSelectedWorker(null);
                                setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left transition-colors cursor-pointer ${
                                selectedWorker === null
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-semibold'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                        >
                            👥 All Workers
                        </button>
                        {workers.map(worker => (
                            <button
                                key={worker.id}
                                onClick={() => {
                                    setSelectedWorker(worker.id);
                                    setDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left transition-colors cursor-pointer ${
                                    selectedWorker === worker.id
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                👤 {worker.name}
                            </button>
                        ))}
                    </div>
                )}
                {dropdownOpen && workers.length === 0 && (
                    <div className="absolute top-full left-0 right-0 sm:w-64 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Loading workers...
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><Users size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedWorker ? 'Selected Worker' : 'Active Workers'}
                            </p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {selectedWorker ? 1 : filteredReports.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400"><FileBarChart size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sheets</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalSheets}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center space-x-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400"><IndianRupee size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{totalPayout.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Worker Breakdown Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileBarChart className="text-blue-500 mr-2" size={20} />
                        {selectedWorker ? `${selectedWorkerName}'s Performance` : 'Worker Performance'} — {monthDisplay}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-12 flex justify-center"><Loader /></div>
                    ) : !hasFetched || filteredReports.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            {hasFetched ? `No production data for ${selectedWorker ? selectedWorkerName : 'this period'}` : 'Select a month and click Load Report.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Worker</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sheets</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Earnings</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredReports.map((r) => (
                                        <tr key={r.workerId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                                                        {r.workerName?.charAt(0) ?? '?'}
                                                    </div>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{r.workerName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-700 dark:text-gray-300">{r.totalSheets}</td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                                ₹{Number(r.totalEarnings).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Totals row */}
                                    <tr className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                                        <td className="px-6 py-3 font-bold text-gray-700 dark:text-gray-300">Total</td>
                                        <td className="px-6 py-3 text-right font-bold text-gray-700 dark:text-gray-300">{totalSheets}</td>
                                        <td className="px-6 py-3 text-right font-bold text-green-700 dark:text-green-400">₹{totalPayout.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReports;

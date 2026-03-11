import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { attendanceService } from '../../services/apiServices';
import type { PendingAttendanceItem, ApprovedAttendanceItem } from '../../types/models';
import { Users, Clock, CheckCircle, XCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const AdminAttendance: React.FC = () => {
    const [pending, setPending] = useState<PendingAttendanceItem[]>([]);
    const [recentApproved, setRecentApproved] = useState<ApprovedAttendanceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionId, setActionId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [pendingRecords, approvedRecords] = await Promise.all([
                attendanceService.getPending(),
                attendanceService.getRecentApproved(),
            ]);
            setPending(pendingRecords);
            setRecentApproved(approvedRecords);
        } catch (err: any) {
            console.error('Failed to fetch pending attendance', err);
            setError('Unable to load attendance records. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (id: number, type: 'approve' | 'reject') => {
        setActionId(id);
        setError(null);
        try {
            if (type === 'approve') {
                await attendanceService.approve(id);
            } else {
                await attendanceService.reject(id);
            }
            // Remove from pending list; approved will appear in the recent-approved section after reload
            setPending(prev => prev.filter(r => r.id !== id));
            // Refresh recent approved list in the background
            const approvedRecords = await attendanceService.getRecentApproved();
            setRecentApproved(approvedRecords);
        } catch (err: any) {
            console.error(`Failed to ${type} attendance`, err);
            const message =
                err?.response?.data?.message ||
                err?.message ||
                `Unable to ${type} attendance. Please try again.`;
            setError(message);
        } finally {
            setActionId(null);
        }
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    const formatTime = (value: string | null) => {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance Approvals</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Review and approve pending worker attendance for today and recent days.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={loadData}
                >
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="text-blue-500" size={20} />
                        <span>Pending Attendance</span>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {pending.length} record{pending.length === 1 ? '' : 's'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {pending.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            There are no pending attendance records right now.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Worker
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Time In
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
                                    {pending.map(record => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                                                        {record.worker.name?.charAt(0) ?? '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                                            {record.worker.name ?? 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {record.worker.email ?? '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                                {formatDate(record.date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                                <Clock className="inline-block mr-1 text-gray-400" size={14} />
                                                {formatTime(record.timeIn)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-yellow-600 dark:text-yellow-400 capitalize">
                                                {record.status}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                                                    disabled={actionId === record.id}
                                                    onClick={() => handleAction(record.id, 'approve')}
                                                >
                                                    <CheckCircle size={14} />
                                                    <span>{actionId === record.id ? 'Processing...' : 'Approve'}</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="inline-flex items-center space-x-1 border-red-500 text-red-600 hover:bg-red-50"
                                                    disabled={actionId === record.id}
                                                    onClick={() => handleAction(record.id, 'reject')}
                                                >
                                                    <XCircle size={14} />
                                                    <span>Reject</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recently Approved (last 24 hours) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <CheckCircle2 className="text-green-500" size={20} />
                        <span>Recently Approved (last 24 hours)</span>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            {recentApproved.length} present
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {recentApproved.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No workers have approved attendance in the last 24 hours.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Worker
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Time In
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Approved At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
                                    {recentApproved.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm shrink-0">
                                                        {record.worker.name?.charAt(0) ?? '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                                            {record.worker.name ?? 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {record.worker.email ?? '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-800 dark:text-gray-200">
                                                {formatDate(record.date)}
                                            </td>
                                            <td className="px-6 py-3 text-gray-800 dark:text-gray-200">
                                                <Clock className="inline-block mr-1 text-gray-400" size={14} />
                                                {formatTime(record.timeIn)}
                                            </td>
                                            <td className="px-6 py-3 text-gray-800 dark:text-gray-200">
                                                <CheckCircle className="inline-block mr-1 text-green-500" size={14} />
                                                {formatTime(record.timeApproved)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAttendance;


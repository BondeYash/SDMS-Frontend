import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Input } from '../../components/ui/Input';
import { attendanceService } from '../../services/apiServices';
import type { AttendanceRecord, AttendanceStatusResponse, AttendanceCalendarResponse } from '../../types/models';
import { Clock, CheckCircle, XCircle, AlertCircle, CalendarDays } from 'lucide-react';

const WorkerAttendance: React.FC = () => {
    const [status, setStatus] = useState<AttendanceStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [calendarData, setCalendarData] = useState<AttendanceCalendarResponse | null>(null);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);

    const loadStatus = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await attendanceService.myStatus();
            setStatus(data);
        } catch (err: any) {
            console.error('Failed to fetch attendance status', err);
            setError('Could not load attendance status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const loadCalendar = async (month: string) => {
        setIsCalendarLoading(true);
        try {
            const data = await attendanceService.getMyCalendar(month);
            setCalendarData(data);
        } catch (err) {
            console.error('Failed to load attendance calendar', err);
        } finally {
            setIsCalendarLoading(false);
        }
    };

    useEffect(() => {
        loadCalendar(selectedMonth);
    }, [selectedMonth]);

    const handleTimeIn = async () => {
        setIsSubmitting(true);
        setError(null);
        setInfoMessage(null);
        try {
            const record = await attendanceService.timeIn();
            setStatus({
                hasRecord: true,
                record,
            });
            setInfoMessage('Attendance submitted successfully and is pending approval.');
        } catch (err: any) {
            console.error('Failed to submit attendance', err);
            const statusCode = err?.response?.status;
            const backendMessage: string | undefined = err?.response?.data?.message;

            // If attendance is already submitted and pending approval, show a friendly info message instead of an error
            if (
                statusCode === 409 &&
                backendMessage &&
                backendMessage.toLowerCase().includes('pending approval')
            ) {
                setInfoMessage(backendMessage);
            } else {
                const fallbackMessage =
                    backendMessage ||
                    err?.message ||
                    'Unable to submit attendance. Please try again.';
                setError(fallbackMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStatusIcon = (record: AttendanceRecord | null | undefined) => {
        if (!record) {
            return <AlertCircle className="text-gray-400" size={32} />;
        }
        if (record.status === 'approved') {
            return <CheckCircle className="text-green-500" size={32} />;
        }
        if (record.status === 'rejected') {
            return <XCircle className="text-red-500" size={32} />;
        }
        return <Clock className="text-yellow-500" size={32} />;
    };

    // Calendar calculations (hooks must stay before any early returns)
    const daysInMonth = useMemo(() => {
        const [yearStr, monthStr] = selectedMonth.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!year || !month) return 30;
        return new Date(year, month, 0).getDate();
    }, [selectedMonth]);

    const firstWeekdayIndex = useMemo(() => {
        const [yearStr, monthStr] = selectedMonth.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!year || !month) return 0;
        const date = new Date(year, month - 1, 1);
        // 0=Sunday..6=Saturday -> we want Monday as first column (0)
        const day = date.getDay();
        return (day + 6) % 7;
    }, [selectedMonth]);

    const calendarRecordsByDate = useMemo(() => {
        const map = new Map<string, AttendanceRecord>();
        if (calendarData?.records) {
            for (const r of calendarData.records) {
                map.set(r.date, r);
            }
        }
        return map;
    }, [calendarData]);

    const record = status?.record ?? null;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
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

    const canTimeIn = !record;

    const getStatusBadge = (r: AttendanceRecord | undefined) => {
        if (!r) return { label: 'Absent', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800/70 dark:text-gray-400' };
        if (r.status === 'approved') {
            return {
                label: 'Present',
                className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            };
        }
        if (r.status === 'pending') {
            return {
                label: 'Pending',
                className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200',
            };
        }
        return {
            label: 'Rejected',
            className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        };
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance</h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <Clock className="mr-1" size={16} /> Today: {formattedDate}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {infoMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-sm text-green-700">{infoMessage}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                        {renderStatusIcon(record)}
                        <span>
                            {record
                                ? record.status === 'approved'
                                    ? 'Attendance Approved'
                                    : record.status === 'rejected'
                                    ? 'Attendance Rejected'
                                    : 'Attendance Pending Approval'
                                : 'No Attendance Marked Yet'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                {record?.date ?? today.toISOString().split('T')[0]}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Time In</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                {formatTime(record?.timeIn ?? null)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                {record?.status ?? 'not submitted'}
                            </p>
                        </div>
                    </div>

                    {record?.timeApproved && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Approved At</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {formatTime(record.timeApproved)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                            {record
                                ? record.status === 'approved'
                                    ? 'Your attendance for today has been approved by admin.'
                                    : record.status === 'rejected'
                                    ? 'Your attendance for today has been rejected. You are marked absent.'
                                    : 'Your attendance is submitted and waiting for admin approval.'
                                : 'You have not marked your attendance for today. Click the button to mark your time-in.'}
                        </div>
                        <Button
                            onClick={handleTimeIn}
                            disabled={!canTimeIn || isSubmitting}
                            className="h-10 px-5"
                        >
                            {isSubmitting
                                ? 'Submitting...'
                                : canTimeIn
                                ? 'Mark Time In'
                                : 'Already Submitted'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Attendance Calendar */}
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="text-blue-500" size={20} />
                        <span>Attendance Calendar</span>
                    </CardTitle>
                    <div className="w-40">
                        <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="min-h-[0] h-9 text-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isCalendarLoading && (
                        <div className="py-6 flex justify-center">
                            <Loader />
                        </div>
                    )}
                    {!isCalendarLoading && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                                    <div key={d} className="text-center">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-xs">
                                {/* Leading blanks */}
                                {Array.from({ length: firstWeekdayIndex }).map((_, i) => (
                                    <div key={`blank-${i}`} />
                                ))}
                                {/* Days */}
                                {Array.from({ length: daysInMonth }).map((_, idx) => {
                                    const day = idx + 1;
                                    const [yearStr, monthStr] = selectedMonth.split('-');
                                    const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
                                    const rec = calendarRecordsByDate.get(dateStr);
                                    const badge = getStatusBadge(rec);

                                    return (
                                        <div
                                            key={dateStr}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 flex flex-col items-center justify-between min-h-[54px] bg-white/60 dark:bg-slate-900/60"
                                        >
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                {day}
                                            </span>
                                            <span
                                                className={`mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                                Calendar shows attendance status per day for the selected month. Days without a record
                                are treated as absent.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkerAttendance;


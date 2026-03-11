export interface Worker {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    isActive: boolean;
    role: 'admin' | 'worker';
    createdAt: string;
}

export interface SheetType {
    id: string;
    name: string;
    code: string;
    pricePerUnit: string | number;
    isActive: boolean;
}

export interface ProductionItem {
    sheetTypeId: string;
    quantity: number;
    pricePerUnit?: string;
    lineTotal?: string;
    sheetType?: {
        name: string;
        code: string;
        pricePerUnit: string;
    };
}

export interface ProductionEntry {
    id: string;
    workerId: string;
    productionDate: string;
    totalSheets: number;
    totalEarnings: string;
    notes?: string;
    createdAt: string;
    items: ProductionItem[];
    worker?: Worker;
}

export interface MonthlyEarnings {
    workerId?: string;
    year?: number;
    month?: number;
    totalSheets: number;
    totalEarnings: string;
    workingDays: number;
    averagePerDay: string;
    dailyBreakdown: {
        date: string;
        sheets: number;
        earnings: string;
    }[];
}

export interface WorkerMonthlyReport {
    workerId: string;
    workerName: string;
    totalSheets: number;
    totalEarnings: string;
}

export type AttendanceStatus = 'pending' | 'approved' | 'rejected';

export interface AttendanceRecord {
    id: number;
    workerId: string;
    date: string;
    status: AttendanceStatus;
    timeIn: string | null;
    timeApproved: string | null;
}

export interface AttendanceStatusResponse {
    hasRecord: boolean;
    record: AttendanceRecord | null;
}

export interface PendingAttendanceItem {
    id: number;
    date: string;
    status: AttendanceStatus;
    timeIn: string | null;
    worker: {
        id: string;
        name?: string;
        email?: string;
    };
}

export interface ApprovedAttendanceItem {
    id: number;
    date: string;
    status: AttendanceStatus;
    timeIn: string | null;
    timeApproved: string | null;
    worker: {
        id: string;
        name?: string;
        email?: string;
    };
}

export interface AttendanceCalendarResponse {
    year: number;
    month: number;
    records: AttendanceRecord[];
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

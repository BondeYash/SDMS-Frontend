import api from './api';
import type { Worker, SheetType, ProductionEntry, MonthlyEarnings, WorkerMonthlyReport } from '../types/models';

export const authService = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    }
};

export const workerService = {
    getAll: async (): Promise<Worker[]> => {
        const response = await api.get<Worker[]>('/workers/get-worker');
        return response.data;
    },
    getByCode: async (code: string): Promise<Worker> => {
        const response = await api.get<Worker>(`/workers/by-code/${code}`);
        return response.data;
    },
    create: async (data: {
        name: string;
        email: string;
        password: string;
        contact?: number;
        role?: string;
    }): Promise<Worker> => {
        const response = await api.post<Worker>('/workers/create-worker', data);
        return response.data;
    },
    update: async (id: string, data: Partial<Worker>): Promise<Worker> => {
        const response = await api.put<Worker>(`/workers/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/workers/${id}`);
    }
};

export const sheetTypeService = {
    getActive: async (): Promise<SheetType[]> => {
        const response = await api.get<SheetType[]>('/sheets/get-sheet-type');
        return response.data;
    },
    create: async (data: { name: string; code: string; pricePerUnit: number }): Promise<SheetType> => {
        const response = await api.post<SheetType>('/sheets/create-sheet-type', data);
        return response.data;
    }
};

export const productionService = {
    createEntry: async (data: { workerId: string; productionDate: string; items: any[]; notes?: string }) => {
        const response = await api.post('/production/create-production', {
            workerId: data.workerId,
            date: data.productionDate,
            entries: data.items,
            notes: data.notes,
        });
        return response.data;
    },

    getWorkerHistory: async (_workerId: string): Promise<ProductionEntry[]> => {
        const response = await api.get<ProductionEntry[]>('/production/history/me');
        return response.data;
    },

    getMonthlyEarnings: async (_workerId: string, monthStr: string): Promise<MonthlyEarnings> => {
        const [year, month] = monthStr.split('-');
        const response = await api.get<MonthlyEarnings>(
            `/production/stats/monthly/me/${year}/${parseInt(month, 10)}`
        );
        return response.data;
    },

    /**
     * Check if the worker has already submitted an entry for a given date.
     * Fetches history and finds the matching productionDate.
     */
    checkDateEntry: async (_workerId: string, date: string): Promise<ProductionEntry | null> => {
        try {
            const response = await api.get<ProductionEntry[]>('/production/history/me');
            const history = response.data;
            if (Array.isArray(history)) {
                return history.find(entry => entry.productionDate === date) || null;
            }
            return null;
        } catch (error: any) {
            console.error("Failed to check date entry", error);
            return null;
        }
    },

    // Admin: get monthly earnings for all workers
    getMonthlyAll: async (year: number, month: number): Promise<WorkerMonthlyReport[]> => {
        const response = await api.get<WorkerMonthlyReport[]>(
            `/production/stats/monthly/all/${year}/${month}`
        );
        return response.data;
    },

    // Admin: get daily stats
    getDailyStats: async (date: string) => {
        const response = await api.get(`/production/stats/daily?date=${date}`);
        return response.data;
    },
};

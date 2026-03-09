import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Worker } from '../types/models';
import { authService } from '../services/apiServices';

interface AuthContextType {
    user: Worker | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Worker | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                console.log("Restoring Auth State:", parsed);
                // Ensure role is lowercase for consistency
                if (parsed && parsed.role) {
                    parsed.role = parsed.role.toLowerCase();
                }
                setUser(parsed);
            } catch (err) {
                console.error("Failed to parse stored user", err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await authService.login(email, password);
            const role = (data.user.role || 'worker').toLowerCase();
            const loggedInUser: Worker = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: role as 'admin' | 'worker',
                isActive: true,
                phone: data.user.contact ? String(data.user.contact) : '',
                createdAt: data.user.createdAt || new Date().toISOString(),
            };
            console.log("Login Successful, User Role:", role);
            setUser(loggedInUser);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            return true;
        } catch (err) {
            console.error('Login failed:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

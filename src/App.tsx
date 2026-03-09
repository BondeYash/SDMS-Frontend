import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import WorkerLayout from './layouts/WorkerLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Pages
import Login from './pages/Login';

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerHistory from './pages/worker/History';
import WorkerEarnings from './pages/worker/Earnings';
import WorkerProfile from './pages/worker/Profile';
import ProductionEntryForm from './pages/worker/ProductionEntryForm';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminWorkers from './pages/admin/Workers';
import AdminSheetTypes from './pages/admin/SheetTypes';
import AdminReports from './pages/admin/Reports';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Worker Routes - Protected (workers only) */}
                    <Route element={<ProtectedRoute workerOnly />}>
                        <Route path="/" element={<WorkerLayout />}>
                            <Route index element={<WorkerDashboard />} />
                            <Route path="history" element={<WorkerHistory />} />
                            <Route path="earnings" element={<WorkerEarnings />} />
                            <Route path="profile" element={<WorkerProfile />} />
                            <Route path="entry" element={<ProductionEntryForm />} />
                        </Route>
                    </Route>

                    {/* Admin Routes - Protected (admins only) */}
                    <Route element={<ProtectedRoute adminOnly />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="workers" element={<AdminWorkers />} />
                            <Route path="sheet-types" element={<AdminSheetTypes />} />
                            <Route path="reports" element={<AdminReports />} />
                        </Route>
                    </Route>

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;

import React, { useState, useEffect } from 'react';
import { workerService } from '../../services/apiServices';
import type { Worker } from '../../types/models';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Search, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

const AdminWorkers: React.FC = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWorkers = async () => {
        try {
            const data = await workerService.getAll();
            setWorkers(data);
        } catch (err) {
            console.error("Failed to load workers", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    // Add Worker State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState('');
    const [newWorker, setNewWorker] = useState({ name: '', email: '', password: '', phone: '', role: 'worker' });

    const handleAddWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setAddError('');
        try {
            await workerService.create({
                name: newWorker.name,
                email: newWorker.email,
                password: newWorker.password,
                contact: parseInt(newWorker.phone) || undefined,
                role: newWorker.role
            });
            setIsAddModalOpen(false);
            setNewWorker({ name: '', email: '', password: '', phone: '', role: 'worker' });
            fetchWorkers(); // Refresh
        } catch (error: any) {
            setAddError(error.response?.data?.message || 'Failed to create worker');
        } finally {
            setIsAdding(false);
        }
    };

    // Edit Worker State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState('');
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', isActive: true });

    const openEditModal = (worker: Worker) => {
        setEditingWorker(worker);
        setEditForm({
            name: worker.name || '',
            email: worker.email || '',
            phone: worker.phone || '',
            isActive: worker.isActive ?? true
        });
        setEditError('');
        setIsEditModalOpen(true);
    };

    const handleUpdateWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWorker) return;
        setIsUpdating(true);
        setEditError('');
        try {
            await workerService.update(editingWorker.id, {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                isActive: editForm.isActive
            });
            setIsEditModalOpen(false);
            fetchWorkers(); // Refresh
        } catch (error: any) {
            setEditError(error.response?.data?.message || 'Failed to update worker');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteWorker = async (workerId: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete worker "${name}"? This action cannot be undone.`)) {
            try {
                await workerService.delete(workerId);
                fetchWorkers(); // Refresh
            } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to delete worker');
            }
        }
    };

    const filteredWorkers = workers.filter(w => {
        const nameMatch = (w.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const phoneMatch = (w.phone || "").includes(searchTerm);
        return nameMatch || phoneMatch;
    });

    if (isLoading) return <Loader fullScreen />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Worker Management</h1>
                    <p className="text-gray-500">View and manage system workers.</p>
                </div>
                <Button className="flex items-center" onClick={() => setIsAddModalOpen(true)}>
                    <UserPlus size={18} className="mr-2" /> Add Worker
                </Button>
            </div>

            <Card>
                <div className="p-4 border-b border-gray-100">
                    <div className="relative w-full max-w-md hidden md:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search workers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border"
                        />
                    </div>
                </div>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredWorkers.map((worker) => (
                                <tr key={worker.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {(worker.name || "?").charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                                                <div className="text-sm text-gray-500">ID: {worker.id.substring(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{worker.phone || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {worker.isActive ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(worker)}
                                                className="p-1 text-blue-600 hover:text-blue-900 rounded-md hover:bg-blue-50 transition-colors"
                                                title="Edit Worker"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteWorker(worker.id, worker.name || 'this worker')}
                                                className="p-1 text-red-600 hover:text-red-900 rounded-md hover:bg-red-50 transition-colors"
                                                title="Delete Worker"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredWorkers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        No workers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => !isAdding && setIsAddModalOpen(false)}
                title="Add New Worker"
            >
                {addError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-sm text-red-700">{addError}</p>
                    </div>
                )}
                <form onSubmit={handleAddWorker} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={newWorker.name}
                        onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={newWorker.email}
                        onChange={e => setNewWorker({ ...newWorker, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={newWorker.password}
                        onChange={e => setNewWorker({ ...newWorker, password: e.target.value })}
                        required
                        minLength={6}
                    />
                    <Input
                        label="Phone Number (Optional)"
                        type="tel"
                        value={newWorker.phone}
                        onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                    />
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)} disabled={isAdding}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isAdding}>
                            Create Worker
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Worker Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => !isUpdating && setIsEditModalOpen(false)}
                title="Edit Worker"
            >
                {editError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-sm text-red-700">{editError}</p>
                    </div>
                )}
                <form onSubmit={handleUpdateWorker} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={editForm.phone}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                    <div className="flex items-center space-x-3 mt-4">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={editForm.isActive}
                            onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Active Account
                        </label>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isUpdating}>
                            Update Worker
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminWorkers;

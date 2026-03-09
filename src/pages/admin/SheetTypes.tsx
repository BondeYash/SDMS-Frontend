import React, { useState, useEffect } from 'react';
import { sheetTypeService } from '../../services/apiServices';
import type { SheetType } from '../../types/models';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2 } from 'lucide-react';

const AdminSheetTypes: React.FC = () => {
    const [sheetTypes, setSheetTypes] = useState<SheetType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Add modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState('');
    const [form, setForm] = useState({ name: '', code: '', pricePerUnit: '' });

    const fetchSheetTypes = async () => {
        try {
            const data = await sheetTypeService.getActive();
            setSheetTypes(data);
        } catch (err) {
            console.error("Failed to load sheet types", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSheetTypes(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');
        const price = parseFloat(form.pricePerUnit);
        if (isNaN(price) || price <= 0) {
            setAddError('Please enter a valid price greater than 0.');
            return;
        }
        setIsAdding(true);
        try {
            await sheetTypeService.create({
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                pricePerUnit: price,
            });
            setIsModalOpen(false);
            setForm({ name: '', code: '', pricePerUnit: '' });
            fetchSheetTypes();
        } catch (err: any) {
            setAddError(err.response?.data?.message || 'Failed to create sheet type. Code may already exist.');
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) return <Loader fullScreen />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sheet Types & Pricing</h1>
                    <p className="text-gray-500">Manage the types of sheets and their prices.</p>
                </div>
                <Button className="flex items-center" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Add Sheet Type
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sheetTypes.map(type => (
                    <Card key={type.id} className="relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${type.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{type.name || 'Unnamed Type'}</h3>
                                    <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium tracking-wide">
                                        {type.code || 'NO-CODE'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 font-medium">Price per unit</p>
                                    <p className="text-xl font-bold text-green-600">₹{Number(type.pricePerUnit).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center border-t pt-4 border-gray-100">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${type.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {type.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                    <Edit2 size={16} className="mr-1" /> Edit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {sheetTypes.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        No active sheet types found.{' '}
                        <button onClick={() => setIsModalOpen(true)} className="text-blue-600 underline">
                            Create one to get started.
                        </button>
                    </div>
                )}
            </div>

            {/* Add Sheet Type Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isAdding && setIsModalOpen(false)}
                title="Add New Sheet Type"
            >
                {addError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700 rounded">
                        {addError}
                    </div>
                )}
                <form onSubmit={handleAdd} className="space-y-4">
                    <Input
                        label="Sheet Type Name"
                        placeholder="e.g. A4 Standard"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Short Code (unique)"
                        placeholder="e.g. A4-STD"
                        value={form.code}
                        onChange={e => setForm({ ...form, code: e.target.value })}
                        required
                    />
                    <Input
                        label="Price Per Unit (₹)"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="e.g. 1.50"
                        value={form.pricePerUnit}
                        onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                        required
                    />
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={isAdding}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isAdding}>
                            Create Sheet Type
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminSheetTypes;

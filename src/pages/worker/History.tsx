import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productionService } from '../../services/apiServices';
import type { ProductionEntry } from '../../types/models';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Calendar, FileText, ChevronRight, IndianRupee } from 'lucide-react';

const WorkerHistory: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<ProductionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<ProductionEntry | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            try {
                const data = await productionService.getWorkerHistory(user.id);
                // Ensure sorted by date descending
                const sorted = data.sort((a, b) => new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime());
                setEntries(sorted);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (isLoading) return <Loader fullScreen />;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-gray-800">Production History</h1>

            {entries.length === 0 ? (
                <Card className="bg-gray-50 border-dashed border-2">
                    <CardContent className="p-8 text-center text-gray-500">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No production entries found.</p>
                        <p className="text-sm">Submit your first entry to see it here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {entries.map(entry => {
                        const date = new Date(entry.productionDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        });

                        return (
                            <Card
                                key={entry.id}
                                className="cursor-pointer hover:shadow-md transition-shadow group"
                                onClick={() => setSelectedEntry(entry)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{date}</h3>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <FileText size={14} className="mr-1 inline" /> {entry.totalSheets} sheets
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase">Earnings</p>
                                            <p className="font-bold text-green-600">₹{Number(entry.totalEarnings).toFixed(2)}</p>
                                        </div>
                                        <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Entry Details Modal */}
            <Modal
                title="Entry Details"
                isOpen={!!selectedEntry}
                onClose={() => setSelectedEntry(null)}
                footer={
                    <Button onClick={() => setSelectedEntry(null)}>Close</Button>
                }
            >
                {selectedEntry && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-semibold">
                                    {new Date(selectedEntry.productionDate).toLocaleDateString('en-IN', {
                                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Status</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Submitted
                                </span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium flex items-center text-gray-700 mb-3 border-b pb-2">
                                <FileText size={16} className="mr-2" /> Breakdown
                            </h4>
                            <div className="space-y-3">
                                {selectedEntry.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.sheetType?.name || 'Unknown Sheet'}</p>
                                            <p className="text-gray-500 text-xs">
                                                {item.quantity} × ₹{Number(item.pricePerUnit).toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-700">
                                            ₹{Number(item.lineTotal).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span className="text-gray-800">Total</span>
                                <span className="text-green-600 flex items-center">
                                    <IndianRupee size={18} className="mr-1" />
                                    {Number(selectedEntry.totalEarnings).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>Total Sheets Submitted</span>
                                <span>{selectedEntry.totalSheets}</span>
                            </div>
                        </div>

                        {selectedEntry.notes && (
                            <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                                <strong>Notes:</strong> {selectedEntry.notes}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WorkerHistory;

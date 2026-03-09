import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sheetTypeService, productionService } from '../../services/apiServices';
import type { SheetType } from '../../types/models';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface Props {
    /** When true, renders in compact mode embedded inside the dashboard */
    inlineDashboard?: boolean;
    /** Called after a successful submission so parent can refresh its state */
    onSubmitSuccess?: () => void;
}

const ProductionEntryForm: React.FC<Props> = ({ inlineDashboard = false, onSubmitSuccess }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [sheetTypes, setSheetTypes] = useState<SheetType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    useEffect(() => {
        const initForm = async () => {
            if (!user) return;

            try {
                // Only check duplicate when NOT in inline-dashboard mode
                // (Dashboard already checked before rendering this component)
                if (!inlineDashboard) {
                    const today = new Date().toISOString().split('T')[0];
                    const existingEntry = await productionService.checkDateEntry(user.id, today);
                    if (existingEntry) {
                        setAlreadySubmitted(true);
                        setIsLoading(false);
                        return;
                    }
                }

                const types = await sheetTypeService.getActive();
                setSheetTypes(types);

                const initialQtys: Record<string, number> = {};
                types.forEach(t => { initialQtys[t.id] = 0; });
                setQuantities(initialQtys);
            } catch (err) {
                console.error("Failed to initialize form", err);
                setError("Failed to load sheet types. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        initForm();
    }, [user, inlineDashboard]);

    const handleQuantityChange = (typeId: string, value: string) => {
        const numValue = value === '' ? 0 : parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            setQuantities(prev => ({ ...prev, [typeId]: numValue }));
        }
    };

    const calculateTotals = () => {
        let totalSheets = 0;
        let totalEarnings = 0;
        sheetTypes.forEach(type => {
            const qty = quantities[type.id] || 0;
            totalSheets += qty;
            totalEarnings += qty * Number(type.pricePerUnit);
        });
        return { totalSheets, totalEarnings };
    };

    const { totalSheets, totalEarnings } = calculateTotals();

    const handleConfirmSubmit = async () => {
        if (!user) return;

        if (totalSheets === 0) {
            setError("Please enter at least one sheet before submitting.");
            setShowConfirm(false);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const today = new Date().toISOString().split('T')[0];
            const items = Object.entries(quantities)
                .filter(([_, qty]) => qty > 0)
                .map(([typeId, qty]) => ({ sheetTypeId: typeId, quantity: qty }));

            await productionService.createEntry({
                workerId: user.id,
                productionDate: today,
                items,
                notes: notes || undefined,
            });

            setSuccess(true);
            setShowConfirm(false);

            // If embedded in dashboard, notify parent to refresh
            if (onSubmitSuccess) {
                setTimeout(() => onSubmitSuccess(), 1500);
            }
        } catch (err: any) {
            console.error("Submission error", err);
            if (err.response?.status === 409) {
                setError("You have already submitted an entry for today!");
            } else if (err.response?.status === 422) {
                setError("Validation error in submitted data. Please check your entries.");
            } else {
                setError(err.response?.data?.message || "Something went wrong. Please try again.");
            }
            setShowConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    if (isLoading) return <Loader fullScreen={!inlineDashboard} />;

    // Already submitted state (standalone page only)
    if (alreadySubmitted) {
        return (
            <div className="space-y-6">
                {!inlineDashboard && (
                    <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
                        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                    </Button>
                )}
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                        <AlertCircle className="text-orange-500 w-16 h-16" />
                        <h2 className="text-xl font-bold text-orange-800">Entry Already Exists</h2>
                        <p className="text-orange-700">You have already submitted an entry for today.</p>
                        <Button className="mt-4" onClick={() => navigate('/history')}>
                            View Today's Entry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                    <CheckCircle className="text-green-500 w-16 h-16" />
                    <h2 className="text-2xl font-bold text-green-800">Entry Submitted!</h2>
                    <p className="text-gray-600">
                        Your production entry for today has been recorded successfully.
                    </p>
                    <div className="bg-white p-4 rounded-lg w-full max-w-sm shadow-sm">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Total Sheets:</span>
                            <span className="font-bold text-gray-800">{totalSheets}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Earnings:</span>
                            <span className="font-bold text-green-600">₹{(totalEarnings || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    {!inlineDashboard && (
                        <div className="space-x-4 mt-6">
                            <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
                            <Button onClick={() => navigate('/history')}>View History</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={inlineDashboard ? "space-y-4" : "space-y-6 max-w-2xl mx-auto pb-20"}>
            {/* Header — only in standalone mode */}
            {!inlineDashboard && (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="-ml-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-800">Today's Production</h1>
                </div>
            )}

            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg flex items-center shadow-sm">
                <CheckCircle size={20} className="mr-2 opacity-70" />
                <span className="font-medium">Filling entry for: {formattedDate}</span>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 border-l-4 border-red-500 p-4 shadow-sm rounded">
                    {error}
                </div>
            )}

            {sheetTypes.length === 0 ? (
                <Card className="bg-gray-50 border-dashed border-2">
                    <CardContent className="p-8 text-center text-gray-500">
                        <p>No active sheet types available.</p>
                        <p className="text-sm mt-1">Please ask your admin to add sheet types.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Sheet type entries */}
                    <div className="space-y-3">
                        {sheetTypes.map(type => (
                            <Card key={type.id} className="overflow-visible shadow-sm hover:shadow transition-shadow">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-gray-800">
                                                {type.name}
                                                <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded ml-2">
                                                    {type.code}
                                                </span>
                                            </h3>
                                            <p className="text-green-600 font-medium text-sm">
                                                ₹{Number(type.pricePerUnit).toFixed(2)} / sheet
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-4 shrink-0 bg-gray-50 p-2 rounded-lg">
                                            <div className="w-24">
                                                <Input
                                                    type="number"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    min="0"
                                                    value={quantities[type.id] === 0 ? '' : quantities[type.id]}
                                                    onChange={(e) => handleQuantityChange(type.id, e.target.value)}
                                                    placeholder="0"
                                                    className="text-center font-bold text-lg"
                                                />
                                            </div>
                                            <div className="w-24 text-right">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subtotal</p>
                                                <p className="font-bold text-gray-800">
                                                    ₹{((quantities[type.id] || 0) * Number(type.pricePerUnit)).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Notes */}
                    <Card className="bg-gray-50 border-dashed border-2">
                        <CardContent className="p-4">
                            <Input
                                label="Notes (optional)"
                                placeholder="Any comments about today's production?"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    {/* Totals + Submit Bar */}
                    <div className={inlineDashboard
                        ? "rounded-xl overflow-hidden"
                        : "fixed bottom-0 md:bottom-auto left-0 right-0 md:relative bg-white border-t border-gray-200 md:border-none md:bg-transparent p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none z-10 md:p-0 md:mt-8"
                    }>
                        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900 text-white p-4 ${inlineDashboard ? 'rounded-xl' : 'max-w-2xl mx-auto md:rounded-xl'}`}>
                            <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Sheets</p>
                                    <p className="text-2xl font-bold">{totalSheets}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Earnings</p>
                                    <p className="text-2xl font-bold text-green-400">₹{totalEarnings.toFixed(2)}</p>
                                </div>
                            </div>
                            <Button
                                className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-blue-500 hover:bg-blue-400 text-white focus:ring-blue-400"
                                onClick={() => setShowConfirm(true)}
                                disabled={totalSheets === 0}
                            >
                                Submit Entry
                            </Button>
                        </div>
                    </div>

                    {/* Mobile spacing */}
                    {!inlineDashboard && <div className="h-24 md:hidden" />}
                </>
            )}

            {/* Confirmation Modal */}
            <Modal
                title="Confirm Submission"
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                footer={
                    <div className="flex space-x-3 w-full justify-end">
                        <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        <Button onClick={handleConfirmSubmit} isLoading={isSubmitting}>Confirm & Submit</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-600">Are you sure you want to submit? You cannot edit it later.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600">Total Sheets:</span>
                            <span className="font-bold">{totalSheets}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600">Total Earnings:</span>
                            <span className="font-bold text-green-600">₹{totalEarnings.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductionEntryForm;

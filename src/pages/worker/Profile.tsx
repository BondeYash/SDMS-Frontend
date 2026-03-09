import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Phone, Calendar, ShieldCheck } from 'lucide-react';

const WorkerProfile: React.FC = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

            <Card className="overflow-hidden">
                <div className="bg-blue-600 p-8 flex flex-col items-center">
                    <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 mb-4 shadow-lg border-4 border-blue-400">
                        {(user.name || '?').charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{user.name || 'User'}</h2>
                    <p className="text-blue-200 mt-1 flex items-center">
                        <ShieldCheck size={16} className="mr-1" /> Verified Worker
                    </p>
                </div>

                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        <div className="p-4 sm:p-6 flex items-start space-x-4">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-600 mt-1">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Worker ID</p>
                                <p className="text-gray-900 font-mono mt-1 text-sm bg-gray-50 p-2 rounded inline-block">{user.id}</p>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 flex items-start space-x-4">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-600 mt-1">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Phone Number</p>
                                <p className="text-gray-900 font-medium mt-1">{user.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 flex items-start space-x-4">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-600 mt-1">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Joined Since</p>
                                <p className="text-gray-900 font-medium mt-1">{joinedDate}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-6 text-center">
                <Button variant="danger" className="w-full sm:w-auto px-12" onClick={logout}>
                    Sign Out
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                    Version 1.0.0
                </p>
            </div>
        </div>
    );
};

export default WorkerProfile;

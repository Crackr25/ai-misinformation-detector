import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, FileSearch, Activity, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import type { SystemStats } from '../types';

interface DashboardProps {
    setActiveTab: (tab: any) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
    const [stats, setStats] = useState<SystemStats>({
        totalScanned: 0,
        flagged: 0,
        verified: 0,
        accuracy: 0
    });

    useEffect(() => {
        setStats(StorageService.getStats());
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-500 mt-1">Real-time statistics of the detection system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Scanned"
                    value={stats.totalScanned}
                    icon={<FileSearch className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Flagged Content"
                    value={stats.flagged}
                    icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
                    color="bg-amber-50"
                />
                <StatCard
                    title="Verified Safe"
                    value={stats.verified}
                    icon={<ShieldCheck className="w-6 h-6 text-green-600" />}
                    color="bg-green-50"
                />
                <StatCard
                    title="Avg. Confidence"
                    value={`${Math.round(stats.accuracy || 0)}%`}
                    icon={<Activity className="w-6 h-6 text-indigo-600" />}
                    color="bg-indigo-50"
                />
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold mb-2">Ready to analyze content?</h3>
                    <p className="text-blue-100 mb-6 text-lg">
                        Use our advanced multi-modal AI detection system to identify misinformation and AI-generated content in seconds.
                    </p>
                    <button
                        onClick={() => setActiveTab('detector')}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Start Analysis
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{title}</p>
        </div>
    );
}

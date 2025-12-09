import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StorageService } from '../services/StorageService';
import type { AnalysisResult } from '../types';

export function Analytics() {
    const [history, setHistory] = useState<AnalysisResult[]>([]);

    useEffect(() => {
        setHistory(StorageService.getHistory());
    }, []);

    // Process data for Risk Distribution
    const riskData = [
        { name: 'Low Risk', value: history.filter(h => h.riskLevel === 'low').length, color: '#22c55e' },
        { name: 'Medium Risk', value: history.filter(h => h.riskLevel === 'medium').length, color: '#f59e0b' },
        { name: 'High Risk', value: history.filter(h => h.riskLevel === 'high').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Process data for Daily Activity (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const activityData = last7Days.map(date => {
        const dayItems = history.filter(h => h.timestamp.startsWith(date));
        return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            AI: dayItems.filter(h => h.isAIGenerated).length,
            Authentic: dayItems.filter(h => !h.isAIGenerated).length,
        };
    });

    // Process common indicators
    const allIndicators = history.flatMap(h => h.indicators);
    const indicatorCounts = allIndicators.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topIndicators = Object.entries(indicatorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
                <p className="text-slate-500 mt-1">Deep dive into detection trends and patterns.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Risk Level Distribution</h3>
                    <div className="h-[300px] w-full">
                        {riskData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {riskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Detection Activity (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="AI" fill="#ef4444" stackId="a" />
                                <Bar dataKey="Authentic" fill="#22c55e" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Indicators */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Most Common Indicators</h3>
                    <div className="h-[300px] w-full">
                        {topIndicators.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topIndicators} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={150} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                No data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

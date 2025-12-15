import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, AlertOctagon, ChevronRight, Search } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import type { AnalysisResult } from '../types';
import { cn } from '../lib/utils';

export function AlertHistory() {
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [filter, setFilter] = useState<'all' | 'flagged' | 'safe'>('all');
    const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

    useEffect(() => {
        const loadHistory = async () => {
            const data = await StorageService.getHistory();
            setHistory(data);
        };
        loadHistory();
    }, []);

    const filteredHistory = history.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'flagged') return item.isAIGenerated;
        if (filter === 'safe') return !item.isAIGenerated;
        return true;
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Alert History</h2>
                    <p className="text-slate-500 mt-1">Archive of all analyzed content and verdicts.</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    {(['all', 'flagged', 'safe'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors",
                                filter === f ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-semibold text-slate-700">Recent Scans</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {filteredHistory.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No history found</p>
                            </div>
                        ) : (
                            filteredHistory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedResult(item)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg border transition-all hover:shadow-md",
                                        selectedResult?.id === item.id
                                            ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                                            : "bg-white border-slate-100 hover:border-blue-100"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-0.5 rounded-full",
                                            item.riskLevel === 'high' ? "bg-red-100 text-red-700" :
                                                item.riskLevel === 'medium' ? "bg-amber-100 text-amber-700" :
                                                    "bg-green-100 text-green-700"
                                        )}>
                                            {item.riskLevel.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">
                                        {item.content}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{item.isAIGenerated ? 'AI Generated' : 'Authentic'}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2">
                    {selectedResult ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                            <div className={cn(
                                "p-6 border-b",
                                selectedResult.riskLevel === 'high' ? "bg-red-50 border-red-100" :
                                    selectedResult.riskLevel === 'medium' ? "bg-amber-50 border-amber-100" :
                                        "bg-green-50 border-green-100"
                            )}>
                                <div className="flex items-center gap-3 mb-2">
                                    {selectedResult.riskLevel === 'high' ? <AlertOctagon className="w-6 h-6 text-red-600" /> :
                                        selectedResult.riskLevel === 'medium' ? <AlertTriangle className="w-6 h-6 text-amber-600" /> :
                                            <CheckCircle className="w-6 h-6 text-green-600" />}
                                    <h3 className="text-xl font-bold text-slate-900">{selectedResult.verdict}</h3>
                                </div>
                                <p className="text-slate-600 text-sm">
                                    Analyzed on {new Date(selectedResult.timestamp).toLocaleString()}
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Content Preview</h4>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">
                                        {selectedResult.imageUrl && (
                                            <img src={selectedResult.imageUrl} alt="Analyzed content" className="max-h-48 rounded-lg mb-4 object-contain" />
                                        )}
                                        <p className="whitespace-pre-wrap">{selectedResult.content}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Confidence</span>
                                        <p className="text-2xl font-bold text-slate-900">{selectedResult.confidenceScore}%</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Classification</span>
                                        <p className={cn(
                                            "text-2xl font-bold",
                                            selectedResult.isAIGenerated ? "text-red-600" : "text-green-600"
                                        )}>
                                            {selectedResult.isAIGenerated ? 'AI Generated' : 'Authentic'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Indicators</h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
                                        {selectedResult.indicators.map((indicator, idx) => (
                                            <li key={idx}>{indicator}</li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedResult.factCheckSuggestion && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Suggestion</h4>
                                        <p className="text-sm text-blue-800">{selectedResult.factCheckSuggestion}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Select an item to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useRef } from 'react';
import { Upload, X, Search, AlertTriangle, CheckCircle, AlertOctagon, Loader2 } from 'lucide-react';
import { OpenRouterService } from '../services/OpenRouterService';
import { StorageService } from '../services/StorageService';
import type { AnalysisResult } from '../types';
import { cn } from '../lib/utils';

interface ContentDetectorProps {
    apiKey: string;
}

export function ContentDetector({ apiKey }: ContentDetectorProps) {
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFetchUrl = async () => {
        if (!url) return;

        setFetchingUrl(true);
        setError(null);
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.contents) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');
                const scripts = doc.querySelectorAll('script, style, nav, footer, header, aside');
                scripts.forEach(script => script.remove());
                const bodyText = doc.body.innerText || "";
                const cleanText = bodyText.replace(/\s+/g, ' ').trim();

                if (cleanText.length < 50) throw new Error("Could not extract enough text from this URL.");
                setText(cleanText);
            } else {
                throw new Error("Failed to fetch content from URL.");
            }
        } catch (err: any) {
            setError("Failed to fetch URL content. The site might be blocking access.");
            console.error(err);
        } finally {
            setFetchingUrl(false);
        }
    };

    const handleAnalyze = async () => {
        if (!text && !image) {
            setError("Please provide text or an image to analyze.");
            return;
        }
        if (!apiKey) {
            setError("API Key is missing. Please configure it in Settings.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const settings = StorageService.getSettings();
            const analysisResult = await OpenRouterService.analyzeContent(text, image, apiKey, settings.model);
            setResult(analysisResult);
            StorageService.addResult(analysisResult);
        } catch (err: any) {
            setError(err.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setText('');
        setUrl('');
        setImage(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Content Analysis</h2>
                    <p className="text-slate-500 mt-1">Paste text or upload an image to detect AI generation.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Import from URL</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/article"
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            <button
                                onClick={handleFetchUrl}
                                disabled={fetchingUrl || !url}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                            >
                                {fetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Fetch
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Text Content</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste article text, social media post, or news content here..."
                            className="w-full h-48 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Image Evidence (Optional)</label>
                        {image ? (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                                <img src={image} alt="Upload preview" className="w-full h-48 object-cover" />
                                <button
                                    onClick={() => { setImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-red-50 text-red-600 transition-colors shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                            >
                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500">Click to upload image</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            {loading ? 'Analyzing...' : 'Analyze Content'}
                        </button>
                        <button
                            onClick={clearAll}
                            disabled={loading}
                            className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
                    <p className="text-slate-500 mt-1">AI detection verdict and detailed indicators.</p>
                </div>

                {result ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className={cn(
                            "p-6 border-b",
                            result.riskLevel === 'high' ? "bg-red-50 border-red-100" :
                                result.riskLevel === 'medium' ? "bg-amber-50 border-amber-100" :
                                    "bg-green-50 border-green-100"
                        )}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className={cn(
                                        "text-lg font-bold flex items-center gap-2",
                                        result.riskLevel === 'high' ? "text-red-800" :
                                            result.riskLevel === 'medium' ? "text-amber-800" :
                                                "text-green-800"
                                    )}>
                                        {result.riskLevel === 'high' ? <AlertOctagon className="w-6 h-6" /> :
                                            result.riskLevel === 'medium' ? <AlertTriangle className="w-6 h-6" /> :
                                                <CheckCircle className="w-6 h-6" />}
                                        {result.verdict}
                                    </h3>
                                    <p className={cn(
                                        "text-sm mt-1",
                                        result.riskLevel === 'high' ? "text-red-600" :
                                            result.riskLevel === 'medium' ? "text-amber-600" :
                                                "text-green-600"
                                    )}>
                                        Confidence Score: {result.confidenceScore}%
                                    </p>
                                </div>
                                <div className={cn(
                                    "px-4 py-2 rounded-full text-sm font-bold",
                                    result.isAIGenerated ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                                )}>
                                    {result.isAIGenerated ? 'AI Generated' : 'Authentic'}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Key Indicators</h4>
                                <ul className="space-y-2">
                                    {result.indicators.map((indicator, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                            {indicator}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {result.factCheckSuggestion && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Fact Check Suggestion</h4>
                                    <p className="text-sm text-blue-800">{result.factCheckSuggestion}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 h-[500px] flex flex-col items-center justify-center text-slate-400">
                        <Search className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No analysis results yet</p>
                        <p className="text-sm">Submit content to see detailed analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
}

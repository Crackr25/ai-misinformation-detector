import { useState, useEffect } from 'react';
import { Save, Trash2, Check, AlertTriangle } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { DEFAULT_MODEL } from '../types';

interface SettingsProps {
    onApiKeyChange: (key: string) => void;
}

export function Settings({ onApiKeyChange }: SettingsProps) {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState(DEFAULT_MODEL);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const settings = StorageService.getSettings();
        setApiKey(settings.apiKey);
        setModel(settings.model || DEFAULT_MODEL);
    }, []);

    const handleSave = () => {
        StorageService.saveSettings({ apiKey, model });
        onApiKeyChange(apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClearData = () => {
        if (confirm('Are you sure you want to clear all history and statistics? This action cannot be undone.')) {
            StorageService.clearAll();
            // Force reload to reset state
            window.location.reload();
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
                <p className="text-slate-500 mt-1">Configure your API connection and system preferences.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            OpenRouter API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-or-..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">openrouter.ai/keys</a>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            AI Model
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        >
                            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
                            <option value="openai/gpt-4o">GPT-4o</option>
                            <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
                            <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Select the AI model used for analysis. Different models have different costs and capabilities.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save Settings'}
                    </button>
                </div>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                        <p className="text-red-700 mt-1 text-sm">
                            Clear all local data, including analysis history and statistics. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleClearData}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

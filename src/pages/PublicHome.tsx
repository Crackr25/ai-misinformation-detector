import React from 'react';
import { PublicDetector } from '../components/PublicDetector';
import { Shield } from 'lucide-react';

export default function PublicHome() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-slate-900">
            {/* Simple Public Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-200">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">
                            AI Misinformation Detector
                        </h1>
                    </div>
                </div>
            </header>

            <main className="px-4 py-12 sm:px-6 lg:px-8">
                <PublicDetector />
            </main>

            <footer className="py-8 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} AI Misinformation Detector. All rights reserved.</p>
            </footer>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Lock, ChevronDown } from "lucide-react";

interface ExportDropdownProps {
    onDownloadPdf: () => void;
    onDownloadWord: () => void;
    isPremium: boolean;
}

export default function ExportDropdown({ onDownloadPdf, onDownloadWord, isPremium }: ExportDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-100 bg-white p-1 shadow-lg shadow-gray-200/50 z-50">
                    <button
                        onClick={() => {
                            onDownloadPdf();
                            setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Download className="h-4 w-4 text-gray-500" />
                        Download PDF
                    </button>

                    <button
                        onClick={() => {
                            onDownloadWord();
                            setIsOpen(false);
                        }}
                        disabled={!isPremium}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isPremium
                                ? "text-blue-700 hover:bg-blue-50"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isPremium ? <FileText className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        Download Word
                    </button>
                </div>
            )}
        </div>
    );
}

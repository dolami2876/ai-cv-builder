"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, ChevronDown } from "lucide-react";

interface ExportDropdownProps {
  onDownloadPdf: () => void;
  onDownloadWord: () => void;
}

export default function ExportDropdown({ onDownloadPdf, onDownloadWord }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white p-1 shadow-lg shadow-gray-200/50">
          <button
            onClick={() => {
              onDownloadPdf();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Download className="h-4 w-4 text-gray-500" />
            Download PDF
          </button>

          <button
            onClick={() => {
              onDownloadWord();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-50"
          >
            <FileText className="h-4 w-4" />
            Download Word
          </button>
        </div>
      )}
    </div>
  );
}

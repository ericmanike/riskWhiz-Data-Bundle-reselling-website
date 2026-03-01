"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({
    text,
    prefix = "",
    className = ""
}: {
    text?: string;
    prefix?: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    if (!text) return null;

    const displayId = text.length > 8 ? `${text.substring(0, 4)}...${text.substring(text.length - 4)}` : text;

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
            {prefix} <span className="font-mono">{displayId}</span>
            <button
                onClick={handleCopy}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-500 hover:text-zinc-900 cursor-pointer"
                title="Copy"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
        </span>
    );
}

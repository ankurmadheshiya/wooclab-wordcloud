"use client";

interface QRCodeDisplayProps {
    url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
    // Use a reliable QR code API since local dependencies might be missing
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    const largeQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(url)}`;

    return (
        <a 
            href={largeQrUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white p-4 rounded-xl shadow-2xl border border-slate-200 inline-block w-48 h-auto hover:scale-105 transition-transform cursor-pointer group"
        >
            <div className="relative">
                <img src={qrUrl} alt="Scan to Join" className="w-full h-auto object-contain" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </div>
                </div>
            </div>
            <p className="mt-3 text-center text-xs font-bold text-slate-700 uppercase tracking-widest">Scan to Join</p>
            <p className="mt-1 text-center text-[10px] text-blue-500 font-semibold group-hover:underline">Click to Enlarge 🔍</p>
        </a>
    );
}

"use client";

interface QRCodeDisplayProps {
    url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
    // Use a reliable QR code API since local dependencies might be missing
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 inline-block w-40 h-auto">
            <img src={qrUrl} alt="Scan to Join" className="w-full h-auto object-contain" loading="lazy" />
            <p className="mt-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest">Scan to Join</p>
        </div>
    );
}

"use client";

import BarcodeView from "@/components/barcode/BarcodeView";

export default function BarcodePage() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <BarcodeView />
    </main>
  );
}

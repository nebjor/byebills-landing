"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@/lib/database.types";

type ExtractionData = {
  type: "income" | "expense";
  document_type: "invoice" | "bill";
  status: "pending" | "paid" | "unpaid";
  counterparty: string | null;
  description: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  document_ref: string | null;
  document_date: string | null;
  due_date: string | null;
  vat_amount: number | null;
  vat_rate: number | null;
};

type Step = "capture" | "extracting" | "verify" | "saving" | "done";

export default function ScanClient({ businesses }: { businesses: Business[] }) {
  const [step, setStep] = useState<Step>("capture");
  const [data, setData] = useState<ExtractionData | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [duplicateHash, setDuplicateHash] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ id: string } | null>(null);
  const [error, setError] = useState("");
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(businesses[0] ?? null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setCameraReady(false);
  }, []);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startCamera() {
    setError("");
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      setError("Camera access denied. Please allow camera access in your browser settings.");
      setCameraActive(false);
    }
  }

  async function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (blob) handleFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  }

  async function handleFile(file: File) {
    if (!activeBusiness) {
      setError("Please select a business first.");
      return;
    }
    setStep("extracting");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("business_id", activeBusiness.id);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setData(result.extraction);
      setConfidence(result.confidence);
      setDuplicateHash(result.duplicateHash);
      setDuplicate(result.duplicate);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
      setStep("capture");
    }
  }

  async function handleConfirm() {
    if (!data || !activeBusiness) return;
    setStep("saving");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          business_id: activeBusiness.id,
          duplicate_hash: duplicateHash,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setStep("verify");
    }
  }

  function updateField<K extends keyof ExtractionData>(key: K, value: ExtractionData[K]) {
    if (data) setData({ ...data, [key]: value });
  }

  function resetScan() {
    stopCamera();
    setStep("capture");
    setData(null);
    setError("");
    setConfidence(0);
    setDuplicateHash(null);
    setDuplicate(null);
  }

  if (!activeBusiness && businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-4">🏢</div>
        <h2 className="text-lg font-semibold mb-2">No business yet</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Create a business on the Home tab first, then come back to scan.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Business selector (if multiple) */}
      {businesses.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBusiness(b)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                activeBusiness?.id === b.id
                  ? "bg-brand text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CAPTURE step */}
      {step === "capture" && !cameraActive && (
        <div className="space-y-3">
          {/* Camera button - big and prominent */}
          <button
            onClick={startCamera}
            className="w-full rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-10 text-center hover:border-brand hover:bg-brand/5 transition-colors active:scale-[0.98]"
          >
            <div className="text-5xl mb-3">📸</div>
            <p className="text-base font-medium text-zinc-700">Scan document</p>
            <p className="text-sm text-zinc-400 mt-1">Take a photo of your invoice or bill</p>
          </button>

          {/* Upload button */}
          <label className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center hover:border-brand hover:bg-brand/5 transition-colors active:scale-[0.98]">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm font-medium text-zinc-700">Upload file</p>
            <p className="text-xs text-zinc-400 mt-1">Photo, PDF, or image file</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </div>
      )}

      {/* Camera view */}
      {step === "capture" && cameraActive && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
            {/* Viewfinder overlay */}
            {cameraReady && (
              <div className="absolute inset-4 border-2 border-white/30 rounded-xl pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />
              </div>
            )}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={stopCamera}
              className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="flex-1 rounded-xl bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
            >
              📷 Capture
            </button>
          </div>
        </div>
      )}

      {/* Extracting */}
      {step === "extracting" && (
        <div className="py-16 text-center">
          <div className="animate-spin inline-block h-10 w-10 border-4 border-brand-light border-t-brand rounded-full mb-4" />
          <p className="text-base font-medium text-zinc-700">Analyzing document...</p>
          <p className="text-sm text-zinc-400 mt-1">AI is extracting invoice data</p>
        </div>
      )}

      {/* Verify step */}
      {step === "verify" && data && (
        <div className="space-y-4">
          {duplicate && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              ⚠️ Possible duplicate detected
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand/10 text-brand px-3 py-1 text-xs font-medium">
              Confidence: {Math.round(confidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Type</span>
              <select
                value={data.type}
                onChange={(e) => updateField("type", e.target.value as ExtractionData["type"])}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Document</span>
              <select
                value={data.document_type}
                onChange={(e) => updateField("document_type", e.target.value as ExtractionData["document_type"])}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="bill">Bill</option>
                <option value="invoice">Invoice</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Counterparty</span>
              <input
                value={data.counterparty ?? ""}
                onChange={(e) => updateField("counterparty", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Amount</span>
              <input
                type="number"
                step="0.01"
                value={data.amount}
                onChange={(e) => updateField("amount", Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Currency</span>
              <input
                value={data.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Status</span>
              <select
                value={data.status}
                onChange={(e) => updateField("status", e.target.value as ExtractionData["status"])}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Date</span>
              <input
                type="date"
                value={data.document_date ?? ""}
                onChange={(e) => updateField("document_date", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Due Date</span>
              <input
                type="date"
                value={data.due_date ?? ""}
                onChange={(e) => updateField("due_date", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="col-span-2 space-y-1">
              <span className="text-xs text-zinc-500">Description</span>
              <input
                value={data.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Reference</span>
              <input
                value={data.document_ref ?? ""}
                onChange={(e) => updateField("document_ref", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-zinc-500">Payment Method</span>
              <input
                value={data.payment_method ?? ""}
                onChange={(e) => updateField("payment_method", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={resetScan}
              className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Discard
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover"
            >
              ✓ Save transaction
            </button>
          </div>
        </div>
      )}

      {/* Saving */}
      {step === "saving" && (
        <div className="py-16 text-center">
          <div className="animate-spin inline-block h-10 w-10 border-4 border-brand-light border-t-brand rounded-full mb-4" />
          <p className="text-base font-medium text-zinc-700">Saving...</p>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Transaction saved!</h3>
          <p className="text-sm text-zinc-500 mb-6">Your invoice has been recorded.</p>
          <div className="flex gap-3 max-w-xs mx-auto">
            <button
              onClick={resetScan}
              className="flex-1 rounded-xl bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Scan another
            </button>
            <button
              onClick={() => router.push("/dashboard/transactions")}
              className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              View history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";

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

type Step = "upload" | "extracting" | "verify" | "saving" | "done";

export default function ScanModal({
  businessId,
  onClose,
}: {
  businessId: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [data, setData] = useState<ExtractionData | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [duplicateHash, setDuplicateHash] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ id: string } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useCamera, setUseCamera] = useState(false);

  async function handleFile(file: File) {
    setStep("extracting");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("business_id", businessId);

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
      setStep("upload");
    }
  }

  async function handleConfirm() {
    if (!data) return;
    setStep("saving");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          business_id: businessId,
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

  async function startCamera() {
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera access denied");
      setUseCamera(false);
    }
  }

  async function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setUseCamera(false);

    canvas.toBlob((blob) => {
      if (blob) handleFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  }

  function updateField<K extends keyof ExtractionData>(
    key: K,
    value: ExtractionData[K]
  ) {
    if (data) setData({ ...data, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {step === "upload" && "Scan Invoice"}
            {step === "extracting" && "Analyzing..."}
            {step === "verify" && "Verify Data"}
            {step === "saving" && "Saving..."}
            {step === "done" && "Done!"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-lg bg-red-50 p-2">{error}</p>
        )}

        {/* Upload step */}
        {step === "upload" && !useCamera && (
          <div className="space-y-3">
            <button
              onClick={startCamera}
              className="w-full rounded-lg border-2 border-dashed p-8 text-center hover:border-zinc-400"
            >
              <span className="text-3xl block mb-2">📸</span>
              <span className="text-sm text-gray-500">Take a photo</span>
            </button>
            <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-center hover:border-zinc-400">
              <span className="text-3xl block mb-2">📄</span>
              <span className="text-sm text-gray-500">Upload file (photo or PDF)</span>
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
        {step === "upload" && useCamera && (
          <div className="space-y-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <button
              onClick={capturePhoto}
              className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Capture
            </button>
          </div>
        )}

        {/* Extracting */}
        {step === "extracting" && (
          <div className="py-12 text-center">
            <div className="animate-spin inline-block h-8 w-8 border-4 border-brand-light border-t-brand rounded-full mb-3" />
            <p className="text-sm text-gray-500">AI is reading your document...</p>
          </div>
        )}

        {/* Verify step */}
        {step === "verify" && data && (
          <div className="space-y-3">
            {duplicate && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                ⚠️ Possible duplicate detected
              </div>
            )}

            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-zinc-100 px-2 py-1">
                Confidence: {Math.round(confidence * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Type</span>
                <select
                  value={data.type}
                  onChange={(e) => updateField("type", e.target.value as ExtractionData["type"])}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Document</span>
                <select
                  value={data.document_type}
                  onChange={(e) => updateField("document_type", e.target.value as ExtractionData["document_type"])}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                >
                  <option value="bill">Bill</option>
                  <option value="invoice">Invoice</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Counterparty</span>
                <input
                  value={data.counterparty ?? ""}
                  onChange={(e) => updateField("counterparty", e.target.value)}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => updateField("amount", Number(e.target.value))}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Currency</span>
                <input
                  value={data.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Status</span>
                <select
                  value={data.status}
                  onChange={(e) => updateField("status", e.target.value as ExtractionData["status"])}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Date</span>
                <input
                  type="date"
                  value={data.document_date ?? ""}
                  onChange={(e) => updateField("document_date", e.target.value)}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Due Date</span>
                <input
                  type="date"
                  value={data.due_date ?? ""}
                  onChange={(e) => updateField("due_date", e.target.value)}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Payment</span>
                <select
                  value={data.payment_method ?? ""}
                  onChange={(e) => updateField("payment_method", e.target.value || null)}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                >
                  <option value="">—</option>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="twint">Twint</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Ref #</span>
                <input
                  value={data.document_ref ?? ""}
                  onChange={(e) => updateField("document_ref", e.target.value)}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
            </div>
            <label className="space-y-1 block">
              <span className="text-xs text-gray-500">Description</span>
              <input
                value={data.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded border px-2 py-1.5 text-sm"
              />
            </label>
            {/* TODO: MWST — vat_amount and vat_rate fields hidden for now */}

            <button
              onClick={handleConfirm}
              className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover mt-2"
            >
              ✓ Confirm & Save
            </button>
          </div>
        )}

        {/* Saving */}
        {step === "saving" && (
          <div className="py-12 text-center">
            <div className="animate-spin inline-block h-8 w-8 border-4 border-brand-light border-t-brand rounded-full mb-3" />
            <p className="text-sm text-gray-500">Saving transaction...</p>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="py-12 text-center space-y-3">
            <span className="text-4xl">✅</span>
            <p className="text-sm text-gray-600">Transaction saved!</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

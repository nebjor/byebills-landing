import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLLMProvider } from "@/lib/llm";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    return await handleExtract(request);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handleExtract(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const businessId = formData.get("business_id") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!businessId) {
    return NextResponse.json(
      { error: "No business_id provided" },
      { status: 400 }
    );
  }

  // Verify user owns this business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Convert file to base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type;

  // Extract invoice data via LLM
  let extraction;
  let providerName: string;
  try {
    const provider = getLLMProvider();
    providerName = provider.name;
    extraction = await provider.extractInvoice(base64, mimeType);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "LLM extraction failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Generate duplicate hash
  const hashInput = [
    businessId,
    extraction.data.counterparty,
    extraction.data.amount,
    extraction.data.document_date,
    extraction.data.document_ref,
  ]
    .filter(Boolean)
    .join("|");
  const duplicateHash = crypto
    .createHash("sha256")
    .update(hashInput)
    .digest("hex");

  // Check for duplicate
  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("duplicate_hash", duplicateHash)
    .maybeSingle() as { data: { id: string } | null };

  return NextResponse.json({
    extraction: extraction.data,
    confidence: extraction.confidence,
    duplicate: existing ? { id: existing.id } : null,
    duplicateHash,
    provider: providerName,
  });
}

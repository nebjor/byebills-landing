import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { business_id, duplicate_hash, ...transactionData } = body;

  // Sanitize payment_method to allowed values
  const allowedPaymentMethods = ["cash", "bank", "twint", "card", "other"];
  if (transactionData.payment_method && !allowedPaymentMethods.includes(transactionData.payment_method)) {
    transactionData.payment_method = "other";
  }

  if (!business_id) {
    return NextResponse.json(
      { error: "business_id required" },
      { status: 400 }
    );
  }

  // Insert transaction
  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert({
      ...transactionData,
      business_id,
      duplicate_hash,
      verified: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Duplicate transaction" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Trigger sync to Google Sheets / other integrations here

  return NextResponse.json({ transaction });
}

import { createClient } from "@/lib/supabase/browser";

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getMyStore(): Promise<Store | null> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("GET_MY_STORE_ERROR");
    console.error("Message:", error.message);
    console.error("Details:", error.details);
    console.error("Hint:", error.hint);
    console.error("Code:", error.code);
    console.error("Full Error:", JSON.stringify(error, null, 2));
    throw error;
  }

  return data;
}

export async function createStore(name: string, description?: string): Promise<Store> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const storeName = name?.trim();
  if (!storeName) throw new Error("Store name is required");

  const { data: existing } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("stores")
    .insert({
      user_id: user.id,
      name: storeName,
      description: description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("CREATE_STORE_ERROR");
    console.error("Message:", error.message);
    console.error("Details:", error.details);
    console.error("Hint:", error.hint);
    console.error("Code:", error.code);
    console.error("Full error:", JSON.stringify(error, null, 2));
    throw error;
  }

  return data;
}

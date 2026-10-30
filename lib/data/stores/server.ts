import { createClient } from "@/lib/supabase/server";

export interface Store {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getStoreByUserId(userId: string): Promise<Store | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function createStoreServer(userId: string, name: string, description?: string): Promise<Store> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("stores")
    .insert({ user_id: userId, name, description: description || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

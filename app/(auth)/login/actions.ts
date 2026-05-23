"use server";

import { createClient } from "@/lib/supabase/server";

export type LoginResult = { success: true } | { success: false; error: string };

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

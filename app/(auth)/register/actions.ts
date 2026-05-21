"use server";

import { createClient } from "@/lib/supabase/server";

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerAction(input: {
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(input);

  if (error) return { success: false, error: error.message };

  // Supabase returns success with empty identities on duplicate email
  // (user-enumeration protection) — surface it as an error to the user.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { success: false, error: "An account with that email already exists." };
  }

  return { success: true };
}

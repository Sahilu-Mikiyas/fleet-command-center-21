import { supabase } from "@/integrations/supabase/client";

const table = "company";

export const companyApi = {
  list: () => supabase.from(table).select("*").order("created_at", { ascending: false }),
  get: (id: string) => supabase.from(table).select("*").eq("id", id).single(),
  create: (payload: Record<string, any>) => supabase.from(table).insert(payload).select().single(),
  update: (id: string, changes: Record<string, any>) =>
    supabase.from(table).update(changes).eq("id", id).select().single(),
};

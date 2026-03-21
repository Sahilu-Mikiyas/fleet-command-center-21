import { supabase } from "@/integrations/supabase/client";

const table = "drivers";

export const driverApi = {
  list: (companyId: string) =>
    supabase.from(table).select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
  create: (payload: Record<string, any>) => supabase.from(table).insert(payload).select().single(),
  update: (id: string, changes: Record<string, any>) =>
    supabase.from(table).update(changes).eq("id", id).select().single(),
};

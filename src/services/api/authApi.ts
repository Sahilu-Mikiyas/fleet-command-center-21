import { supabase } from "@/integrations/supabase/client";

interface Credentials {
  email: string;
  password: string;
}

interface SignupPayload extends Credentials {
  fullName?: string;
  companyName?: string;
  licenseNumber?: string;
  userRole?: "passenger" | "operator";
}

export const authApi = {
  login: ({ email, password }: Credentials) =>
    supabase.auth.signInWithPassword({ email, password }),

  signup: ({ email, password, fullName, companyName, licenseNumber, userRole }: SignupPayload) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          license_number: licenseNumber,
          user_role: userRole,
        },
      },
    }),

  logout: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),
};

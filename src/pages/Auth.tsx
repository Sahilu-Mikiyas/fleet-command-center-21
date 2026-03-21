import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api";
import { authReducer, initialAuthState } from "@/state/authReducer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [fullName, setFullName] = useState(""),
    [company, setCompany] = useState(""),
    [license, setLicense] = useState("");
  const navigate = useNavigate();
  const { loading, error, mode, role } = state;

  useEffect(() => {
    (async () => {
      const { data } = await authApi.getSession();
      if (data.session) {
        await handleRoleRoute(data.session.user.id);
      }
    })();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRoleRoute = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error || !data?.role) {
      dispatch({ type: "FAIL", error: "Unable to resolve role" });
      return;
    }
    if (data.role === "operator") {
      const { data: op } = await supabase
        .from("operators")
        .select("is_approved")
        .eq("user_id", userId)
        .single();
      if (!op?.is_approved) {
        toast.error("Operator pending approval");
        return;
      }
      navigate("/operator");
      return;
    }
    if (data.role === "admin") {
      navigate("/admin");
      return;
    }
    navigate("/dashboard");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch({ type: "START" });
    try {
      if (mode === "login") {
        const { data, error } = await authApi.login({ email, password });
        if (error || !data.user) throw error ?? new Error("Login failed");
        dispatch({ type: "SUCCESS", user: { id: data.user.id, email: data.user.email! } });
        await handleRoleRoute(data.user.id);
      } else {
        const { data, error } = await authApi.signup({
          email,
          password,
          fullName,
          companyName: company,
          licenseNumber: license,
          userRole: role,
        });
        if (error || !data.user) throw error ?? new Error("Signup failed");
        dispatch({ type: "SUCCESS", user: { id: data.user.id, email: data.user.email! } });
        await handleRoleRoute(data.user.id);
      }
    } catch (err: any) {
      dispatch({ type: "FAIL", error: err.message || "Authentication failed" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <Card className="w-full max-w-lg space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl">{mode === "login" ? "Welcome Back" : "Create an account"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <button
              className={mode === "login" ? "text-teal-400 font-semibold" : ""}
              onClick={() => dispatch({ type: "SET_MODE", mode: "login" })}
              type="button"
            >
              Login
            </button>
            <button
              className={mode === "signup" ? "text-teal-400 font-semibold" : ""}
              onClick={() => dispatch({ type: "SET_MODE", mode: "signup" })}
              type="button"
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={role === "passenger"}
                      onChange={() => dispatch({ type: "SET_ROLE", role: "passenger" })}
                    />
                    Passenger
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={role === "operator"}
                      onChange={() => dispatch({ type: "SET_ROLE", role: "operator" })}
                    />
                    Operator
                  </label>
                </div>
                {role === "operator" && (
                  <>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="license">License</Label>
                      <Input id="license" value={license} onChange={(e) => setLicense(e.target.value)} />
                    </div>
                  </>
                )}
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api/auth";
import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const { user, userRole, isLoading: authLoading, login, signup } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [fullName, setFullName] = useState(""),
    [company, setCompany] = useState(""),
    [license, setLicense] = useState("");
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"passenger" | "operator">("passenger");
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user && userRole) {
      handleRoleRedirect(user, userRole);
    }
  }, [user, userRole]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(undefined);
    }
  }, [error]);

  const handleRoleRedirect = (currentUser: typeof user, currentRole: typeof userRole) => {
    if (!currentUser || !currentRole) return;

    if (currentRole === 'OPERATOR' && !currentUser.isApproved) {
      navigate('/processing');
    } else if (currentRole === 'SUPER_ADMIN') {
      navigate('/admin'); // Assuming an admin dashboard route
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({
          email,
          password,
          fullName,
          companyName: company,
          licenseNumber: license,
          userRole: role === "passenger" ? "SHIPPER" : "OPERATOR", // Map to actual UserRole enum
        });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
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
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={mode === "signup" ? "text-teal-400 font-semibold" : ""}
              onClick={() => setMode("signup")}
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
                      onChange={() => setRole("passenger")}
                    />
                    Passenger
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={role === "operator"}
                      onChange={() => setRole("operator")}
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
                <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

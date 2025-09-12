import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, TrendingUp } from "lucide-react";

const Login = () => {
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const emailToUse = authMethod === "email" ? loginIdentifier : `${loginIdentifier}@temp.com`;
    await signIn(emailToUse, loginPassword);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg gradient-primary">
              <TrendingUp className="h-5 w-5 text-white m-1.5" />
            </div>
            <span className="text-xl font-bold text-gradient">CryptoFlow</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="glass-card shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">CryptoFlow Account Login</CardTitle>
            <p className="text-muted-foreground text-sm">Welcome back! Sign in with your email or phone number</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Method Toggle */}
            <div className="flex rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  authMethod === "email"
                    ? "gradient-primary text-white shadow-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("mobile")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  authMethod === "mobile"
                    ? "gradient-primary text-white shadow-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mobile number
              </button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label>{authMethod === "email" ? "Email" : "Mobile number"}</Label>
                <Input
                  type={authMethod === "email" ? "email" : "tel"}
                  placeholder={authMethod === "email" ? "Please enter your email address" : "Please enter your mobile number"}
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Please enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberPassword}
                    onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember password
                  </label>
                </div>
                <Link to="/reset-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
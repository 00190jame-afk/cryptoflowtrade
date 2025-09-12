import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelector } from "@/components/ui/country-selector";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, TrendingUp } from "lucide-react";

const Register = () => {
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("mobile");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null);
  
  const { signUp, user, sendVerificationCode, validateInviteCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      alert("Invite code is required");
      return;
    }
    
    if (!verificationCode.trim()) {
      alert("Verification code is required");
      return;
    }
    
    if (!agreeToTerms) {
      alert("Please agree to the Terms of Service");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    setLoading(true);
    const identifier = authMethod === "email" ? email : `${countryCode}${mobileNumber}`;
    
    await signUp({
      email: authMethod === "email" ? email : undefined,
      phone: authMethod === "mobile" ? `${countryCode}${mobileNumber}` : undefined,
      password,
      verificationCode,
      inviteCode,
      authMethod: authMethod === "mobile" ? "phone" : "email"
    });
    setLoading(false);
  };

  const handleGetVerificationCode = async () => {
    const identifier = authMethod === "email" ? email : `${countryCode}${mobileNumber}`;
    
    if (!identifier.trim()) {
      alert(`Please enter your ${authMethod === "email" ? "email" : "mobile number"}`);
      return;
    }

    const { error, code } = await sendVerificationCode(identifier, authMethod === "mobile" ? "phone" : "email");
    if (!error) {
      setVerificationSent(true);
      // For demo purposes, show the code in an alert
      if (code) {
        alert(`Demo: Your verification code is ${code}`);
      }
    }
  };

  const handleInviteCodeChange = async (value: string) => {
    setInviteCode(value);
    
    if (value.trim().length >= 4) {
      const { valid } = await validateInviteCode(value);
      setInviteCodeValid(valid);
    } else {
      setInviteCodeValid(null);
    }
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
            <CardTitle className="text-2xl mb-2">Create CryptoFlow Account</CardTitle>
            <p className="text-muted-foreground text-sm">Register with your email or mobile number</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Method Toggle */}
            <div className="flex rounded-lg bg-muted p-1">
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
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              {authMethod === "mobile" ? (
                <div className="space-y-4">
                  <Label>Mobile phone number</Label>
                  <div className="flex gap-2">
                    <CountrySelector
                      value={countryCode}
                      onValueChange={setCountryCode}
                    />
                    <Input
                      placeholder="Mobile phone number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Please enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Verification code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleGetVerificationCode}
                    variant="secondary"
                    className="px-6"
                  >
                    Obtain
                  </Button>
                </div>
                {verificationSent && (
                  <p className="text-sm text-green-600">Verification code sent!</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Please enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Please enter your password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Invite code *</Label>
                <div className="relative">
                  <Input
                    placeholder="Enter invite code (required)"
                    value={inviteCode}
                    onChange={(e) => handleInviteCodeChange(e.target.value)}
                    required
                    className={inviteCodeValid === false ? "border-destructive" : inviteCodeValid === true ? "border-green-500" : ""}
                  />
                  {inviteCodeValid === true && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm">✓</div>
                  )}
                  {inviteCodeValid === false && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-destructive text-sm">✗</div>
                  )}
                </div>
                {inviteCodeValid === false && (
                  <p className="text-destructive text-xs">Invalid invite code</p>
                )}
                <p className="text-xs text-muted-foreground">Try: WELCOME1, BETA2024, or TESTCODE</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I have read and agree to{" "}
                  <span className="text-primary cursor-pointer hover:underline">
                    CryptoFlow Terms of Service
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300"
                disabled={loading || !agreeToTerms || !inviteCode.trim() || !verificationCode.trim() || inviteCodeValid === false}
              >
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
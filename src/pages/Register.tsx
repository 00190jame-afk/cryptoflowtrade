import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, TrendingUp } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  const { signUp, user, validateInviteCode, sendVerificationCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSendVerification = async () => {
    if (!email.trim()) {
      alert("Email is required");
      return;
    }

    setLoading(true);
    const { error } = await sendVerificationCode(email, "email");
    
    if (!error) {
      setVerificationSent(true);
      setShowVerification(true);
      alert("Verification code sent to your email!");
    } else {
      alert("Failed to send verification code. Please try again.");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    
    if (!verificationCode.trim()) {
      alert("Please enter the verification code");
      return;
    }
    
    if (!inviteCode.trim()) {
      alert("Invite code is required");
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
    
    await signUp({
      email,
      password,
      inviteCode
    });
    setLoading(false);
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
            <p className="text-muted-foreground text-sm">Register with your email address</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignUp} className="space-y-4">
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

              <div className="space-y-2">
                <Label>Email Verification</Label>
                {!showVerification ? (
                  <Button
                    type="button"
                    onClick={handleSendVerification}
                    variant="secondary"
                    className="w-full"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? "Sending..." : "Send Verification Code"}
                  </Button>
                ) : (
                  <>
                    <Input
                      placeholder="Enter 6-digit verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-green-600">
                      Verification code sent to your email. Please check your inbox.
                    </p>
                  </>
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
                <p className="text-xs text-muted-foreground">
                  Password must contain uppercase, lowercase, numbers, and special characters
                </p>
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
                disabled={loading || !agreeToTerms || !inviteCode.trim() || inviteCodeValid === false || !verificationCode.trim()}
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
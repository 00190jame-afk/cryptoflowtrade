import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, TrendingUp } from "lucide-react";

const Auth = () => {
  // Auth method selection
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("mobile");
  
  // Registration form state
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Reset password state
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetVerificationCode, setResetVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<"auth" | "reset">("auth");
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // For now, we'll use email-based auth with Supabase
    const emailToUse = authMethod === "email" ? loginIdentifier : `${mobileNumber}@temp.com`;
    await signIn(emailToUse, loginPassword);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      alert("Please agree to the Terms of Service");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    setLoading(true);
    // For now, we'll use email-based auth with Supabase
    const emailToUse = authMethod === "email" ? email : `${mobileNumber}@temp.com`;
    await signUp(emailToUse, password);
    setLoading(false);
  };

  const handleGetVerificationCode = () => {
    // Placeholder for verification code functionality
    alert("Verification code would be sent here");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Passwords don't match");
      return;
    }
    // Placeholder for reset password functionality
    alert("Password reset would be implemented here");
  };

  if (currentView === "reset") {
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
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <p className="text-muted-foreground text-sm">
                For the safety of your assets, transactions are prohibited for 24 hours after changing your password.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auth Method Toggle */}
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setAuthMethod("mobile")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    authMethod === "mobile"
                      ? "bg-card text-foreground shadow-sm"
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
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Email
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {authMethod === "mobile" ? (
                  <div className="space-y-4">
                    <Label className="text-foreground">Mobile phone number</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+86">+86</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Mobile phone number"
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Please enter your email address"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Verification code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter verification code"
                      value={resetVerificationCode}
                      onChange={(e) => setResetVerificationCode(e.target.value)}
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
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Please enter your password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Please enter your password again"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300"
                  disabled={loading}
                >
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <CardContent className="p-0">
            <Tabs defaultValue="register" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted rounded-none">
                <TabsTrigger value="register" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
                <TabsTrigger value="login" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="register" className="p-6 space-y-6">
                <div>
                  <CardTitle className="text-2xl mb-2">Create CryptoFlow Account</CardTitle>
                  <p className="text-muted-foreground text-sm">Register with your email or mobile number</p>
                </div>

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
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+86">+86</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Mobile phone number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          required
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
                    <Input
                      placeholder="Invite code (optional)"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
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
                    disabled={loading || !agreeToTerms}
                  >
                    {loading ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="p-6 space-y-6">
                <div>
                  <CardTitle className="text-2xl mb-2">CryptoFlow Account Login</CardTitle>
                  <p className="text-muted-foreground text-sm">Welcome back! Sign in with your email or phone number</p>
                </div>

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
                  {authMethod === "email" ? (
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="Please enter your email address"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label>Mobile phone number</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+86">+86</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Mobile phone number"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberPassword}
                      onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember my password
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setCurrentView("reset")}
                    className="text-primary hover:underline text-sm"
                  >
                    Forget password?
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Reset Password</CardTitle>
              <p className="text-gray-400 text-sm">
                For the safety of your assets, transactions are prohibited for 24 hours after changing your password.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auth Method Toggle */}
              <div className="flex rounded-lg bg-gray-700 p-1">
                <button
                  type="button"
                  onClick={() => setAuthMethod("mobile")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    authMethod === "mobile"
                      ? "bg-gray-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Mobile number
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod("email")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    authMethod === "email"
                      ? "bg-gray-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Email
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {authMethod === "mobile" ? (
                  <div className="space-y-4">
                    <Label className="text-white">Mobile phone number</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+86">+86</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Mobile phone number"
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      placeholder="Please enter your email address"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-white">Verification code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter verification code"
                      value={resetVerificationCode}
                      onChange={(e) => setResetVerificationCode(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                    <Button
                      type="button"
                      onClick={handleGetVerificationCode}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-6"
                    >
                      Obtain
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Password</Label>
                  <Input
                    type="password"
                    placeholder="Please enter your password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Please enter your password again"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <Tabs defaultValue="register" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700 rounded-none">
                <TabsTrigger value="register" className="text-white data-[state=active]:bg-gray-600">
                  Register
                </TabsTrigger>
                <TabsTrigger value="login" className="text-white data-[state=active]:bg-gray-600">
                  Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="register" className="p-6 space-y-6">
                <div>
                  <CardTitle className="text-white text-2xl mb-2">Create BT Exchange Account</CardTitle>
                  <p className="text-gray-400 text-sm">Register with your email or mobile number</p>
                </div>

                {/* Auth Method Toggle */}
                <div className="flex rounded-lg bg-gray-700 p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMethod("mobile")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      authMethod === "mobile"
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Mobile number
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod("email")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      authMethod === "email"
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Email
                  </button>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {authMethod === "mobile" ? (
                    <div className="space-y-4">
                      <Label className="text-white">Mobile phone number</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+86">+86</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Mobile phone number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-white">Email</Label>
                      <Input
                        type="email"
                        placeholder="Please enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white">Verification code</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleGetVerificationCode}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6"
                      >
                        Obtain
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Password</Label>
                    <Input
                      type="password"
                      placeholder="Please enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Please enter your password again"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      className="border-gray-600 data-[state=checked]:bg-yellow-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I have read and agree to{" "}
                      <span className="text-yellow-500 cursor-pointer hover:underline">
                        BT Exchange Terms of Service
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                    disabled={loading || !agreeToTerms}
                  >
                    {loading ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="p-6 space-y-6">
                <div>
                  <CardTitle className="text-white text-2xl mb-2">BT Exchange Account Login</CardTitle>
                  <p className="text-gray-400 text-sm">Welcome back! Sign in with your email, phone number</p>
                </div>

                {/* Auth Method Toggle */}
                <div className="flex rounded-lg bg-gray-700 p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMethod("email")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      authMethod === "email"
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod("mobile")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      authMethod === "mobile"
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Mobile number
                  </button>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {authMethod === "email" ? (
                    <div className="space-y-2">
                      <Label className="text-white">Email</Label>
                      <Input
                        type="email"
                        placeholder="Please enter your email address"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className="text-white">Mobile phone number</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+86">+86</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Mobile phone number"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white">Password</Label>
                    <Input
                      type="password"
                      placeholder="Please enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberPassword}
                      onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                      className="border-gray-600 data-[state=checked]:bg-yellow-500"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-300">
                      Remember my password
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setCurrentView("reset")}
                    className="text-yellow-500 hover:underline text-sm"
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountrySelector } from "@/components/ui/country-selector";
import { ArrowLeft, TrendingUp } from "lucide-react";

const ResetPassword = () => {
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("mobile");
  const [countryCode, setCountryCode] = useState("+1");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetVerificationCode, setResetVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Passwords don't match");
      return;
    }
    alert("Password reset would be implemented here");
  };

  const handleGetVerificationCode = () => {
    alert("Verification code would be sent here");
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
                    <CountrySelector
                      value={countryCode}
                      onValueChange={setCountryCode}
                    />
                    <Input
                      placeholder="Mobile phone number"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
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
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
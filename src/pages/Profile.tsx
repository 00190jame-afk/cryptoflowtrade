import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Shield, Settings, Mail, User, Wallet, MessageCircle, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credit_score: number;
  wallet_address: string | null;
}
interface UserBalance {
  balance: number;
  currency: string;
}
const languages = [{
  code: 'en',
  name: 'English',
  flag: '🇬🇧🇺🇸'
}, {
  code: 'de',
  name: 'German',
  flag: '🇩🇪🇦🇹🇨🇭'
}, {
  code: 'fr',
  name: 'French',
  flag: '🇫🇷🇧🇪🇨🇭🇱🇺'
}, {
  code: 'es',
  name: 'Spanish',
  flag: '🇪🇸🇦🇷🇲🇽'
}, {
  code: 'it',
  name: 'Italian',
  flag: '🇮🇹🇨🇭'
}, {
  code: 'pt',
  name: 'Portuguese',
  flag: '🇵🇹🇧🇷'
}, {
  code: 'ru',
  name: 'Russian',
  flag: '🇷🇺🇪🇪🇱🇻🇱🇹'
}, {
  code: 'pl',
  name: 'Polish',
  flag: '🇵🇱'
}];
export default function Profile() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    avatar: null as File | null
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAddressInput, setWalletAddressInput] = useState('');

  // Loading states
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);
  const fetchProfile = async () => {
    try {
      // Fetch profile data
      const {
        data: profileData,
        error: profileError
      } = await supabase.from('profiles').select('*').eq('user_id', user?.id).single();
      if (profileError) throw profileError;

      // Fetch balance data
      const {
        data: balanceData,
        error: balanceError
      } = await supabase.from('user_balances').select('balance, currency').eq('user_id', user?.id).single();
      setProfile(profileData);
      setBalance(balanceData || {
        balance: 0,
        currency: 'USD'
      });
      setEditForm({
        username: profileData.username || '',
        full_name: profileData.full_name || '',
        avatar: null
      });
      setWalletAddress(profileData.wallet_address || '');
      setWalletAddressInput(profileData.wallet_address || '');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAvatar = async () => {
    if (!user || !profile) return;
    setUpdateLoading(true);
    try {
      // Update profile to remove avatar_url
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await fetchProfile();
      toast({
        title: "Success",
        description: "Profile picture deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile picture",
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!user || !profile) return;
    setUpdateLoading(true);
    try {
      let avatarUrl = profile.avatar_url;

      // Handle avatar upload
      if (editForm.avatar) {
        const fileExt = editForm.avatar.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;
        const {
          error: uploadError
        } = await supabase.storage.from('avatars').upload(fileName, editForm.avatar, {
          upsert: true
        });
        if (uploadError) throw uploadError;
        avatarUrl = fileName;
      }

      // Update profile
      const {
        error
      } = await supabase.from('profiles').update({
        username: editForm.username,
        full_name: '',
        avatar_url: avatarUrl
      }).eq('user_id', user.id);
      if (error) throw error;
      await fetchProfile();
      setEditProfileOpen(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      if (error) throw error;
      setChangePasswordOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast({
        title: "Success",
        description: "Password updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };
  const handleSaveWalletAddress = async () => {
    if (!user) return;
    setWalletLoading(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        wallet_address: walletAddressInput
      }).eq('user_id', user.id);
      if (error) throw error;
      setWalletAddress(walletAddressInput);
      toast({
        title: "Success",
        description: "Wallet address saved successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save wallet address",
        variant: "destructive"
      });
    } finally {
      setWalletLoading(false);
    }
  };
  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive"
      });
    }
  };
  const getAvatarUrl = () => {
    if (!profile?.avatar_url) return '';
    const {
      data
    } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
    return data.publicUrl;
  };
  const getDisplayName = () => {
    if (profile?.username) return profile.username;
    if (profile?.full_name) return profile.full_name;
    return "User";
  };
  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  if (authLoading || loading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>;
  }
  if (!user || !profile) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back to Home Button */}
      <div className="container mx-auto px-4 pt-6 pb-2 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Full Width Profile Header */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                <AvatarImage src={getAvatarUrl()} alt="Profile picture" />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{getDisplayName()}</h1>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  UID: {user.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Credit Score: {profile.credit_score}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Settings Section */}
        <div className="space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account information and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your profile information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="username">Name</Label>
                          <Input id="username" value={editForm.username} onChange={e => setEditForm({
                        ...editForm,
                        username: e.target.value
                      })} placeholder="Enter your name" />
                        </div>
                        <div>
                          <Label htmlFor="avatar">Profile Picture</Label>
                          <Input id="avatar" type="file" accept="image/*" onChange={e => setEditForm({
                        ...editForm,
                        avatar: e.target.files?.[0] || null
                      })} />
                          {profile?.avatar_url && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={handleDeleteAvatar} 
                              disabled={updateLoading}
                              className="mt-2 text-destructive hover:text-destructive"
                            >
                              Delete Current Picture
                            </Button>
                          )}
                        </div>
                        <Button onClick={handleEditProfile} disabled={updateLoading} className="w-full">
                          {updateLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Update your account password
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <PasswordInput id="currentPassword" value={passwordForm.currentPassword} onChange={e => setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value
                      })} />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <PasswordInput id="newPassword" value={passwordForm.newPassword} onChange={e => setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value
                      })} />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <PasswordInput id="confirmPassword" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value
                      })} />
                        </div>
                        <Button onClick={handleChangePassword} disabled={passwordLoading} className="w-full">
                          {passwordLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Update Password
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
            
            {/* Wallet Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Settings
                </CardTitle>
                <CardDescription>
                  {walletAddress ? "Replace your linked wallet address" : "Link your crypto wallet address"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletAddress && (
                    <div className="text-sm bg-muted p-3 rounded break-all border-l-4 border-l-primary">
                      <Label className="text-xs text-muted-foreground">Currently Linked Address:</Label>
                      <div className="mt-1 font-mono">{walletAddress}</div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input 
                      value={walletAddressInput} 
                      onChange={e => setWalletAddressInput(e.target.value)} 
                      placeholder={walletAddress ? "Enter new wallet address to replace current one" : "Enter your wallet address"} 
                    />
                    <Button onClick={handleSaveWalletAddress} disabled={walletLoading}>
                      {walletLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {walletAddress ? "Replace" : "Link"}
                    </Button>
                  </div>
                  {walletAddress && (
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Replacing your wallet address will unlink the current address. Only one address can be linked at a time.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Security Settings */}
            
            
            {/* Preferences */}
            
            
            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Support
                </CardTitle>
                <CardDescription>
                  Get help when you need it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" onClick={() => navigate('/messages')} className="w-full justify-start">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  User Messages
                </Button>
                <Button variant="outline" onClick={() => navigate('/contact')} className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
            
        </div>
      </main>
    </div>;
}
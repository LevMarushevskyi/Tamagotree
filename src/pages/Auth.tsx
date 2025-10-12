import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Leaf } from "lucide-react";
import { validateUsername, MAX_USERNAME_LENGTH } from "@/utils/nameValidation";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotEmail, setShowForgotEmail] = useState(false);
  const [foundEmail, setFoundEmail] = useState("");
  const [obfuscatedEmail, setObfuscatedEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if passwords match and meet requirements
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const passwordTooShort = password.length > 0 && password.length < 8;
  const confirmPasswordTouched = confirmPassword.length > 0;

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    const usernameToUse = username || email.split("@")[0];
    const usernameValidation = validateUsername(usernameToUse);
    if (!usernameValidation.valid) {
      toast({
        title: "Invalid Username",
        description: usernameValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            username: usernameToUse,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Welcome to Tamagotree! 🌱",
        description: "Check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
      setShowForgotPassword(false);
      setShowForgotEmail(false);
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLookupEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await supabase.functions.invoke('lookup-email-by-username', {
        body: { username },
      });

      if (response.error) {
        throw response.error;
      }

      const { email: userEmail, obfuscatedEmail: obfEmail, message } = response.data;

      if (userEmail) {
        // Found the email
        setFoundEmail(userEmail);
        setObfuscatedEmail(obfEmail);
        setEmail(userEmail);
        toast({
          title: "Email found",
          description: `We found an account with email: ${obfEmail}`,
        });
      } else {
        // Username not found, but don't reveal this for security
        toast({
          title: "Request processed",
          description: message || "If this username exists, a password reset email will be sent.",
        });
        setShowForgotEmail(false);
        setShowForgotPassword(false);
      }
    } catch (error: any) {
      toast({
        title: "Lookup failed",
        description: error.message || "An error occurred while looking up your username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="w-12 h-12 text-primary animate-wiggle" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tamagotree
            </h1>
          </div>
          <p className="text-muted-foreground">Grow trees, earn XP, save Durham</p>
        </div>

        <Card className="shadow-xl border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Join the Tree Guardians</CardTitle>
            <CardDescription>
              Create an account or sign in to start caring for trees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                {!showForgotPassword && !showForgotEmail ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                ) : showForgotEmail ? (
                  <form onSubmit={handleLookupEmail} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lookup-username">Username</Label>
                      <Input
                        id="lookup-username"
                        type="text"
                        placeholder="tree_guardian"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your username and we'll help you find your email address
                      </p>
                    </div>
                    {foundEmail && (
                      <div className="rounded-md bg-primary/10 p-3 space-y-2">
                        <p className="text-sm font-medium">Email found:</p>
                        <p className="text-sm text-muted-foreground">{obfuscatedEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          You can now send a password reset link to this email
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {!foundEmail ? (
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Looking up..." : "Find My Email"}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowForgotEmail(false);
                            setShowForgotPassword(true);
                          }}
                          disabled={loading}
                        >
                          Continue to Reset Password
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setShowForgotEmail(false);
                          setShowForgotPassword(false);
                          setFoundEmail("");
                          setObfuscatedEmail("");
                        }}
                        disabled={loading}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reset-email">Email</Label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setShowForgotEmail(true);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot email?
                        </button>
                      </div>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send you a password reset link to your email
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setFoundEmail("");
                          setObfuscatedEmail("");
                        }}
                        disabled={loading}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="tree_guardian"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={MAX_USERNAME_LENGTH}
                    />
                    <p className="text-xs text-muted-foreground">
                      Max {MAX_USERNAME_LENGTH} characters, letters, numbers, underscores and hyphens only
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className={passwordTooShort ? "border-destructive" : ""}
                    />
                    {passwordTooShort && (
                      <p className="text-xs text-destructive">
                        Password must be at least 8 characters long
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className={
                        confirmPasswordTouched
                          ? passwordsMatch
                            ? "border-green-500"
                            : "border-destructive"
                          : ""
                      }
                    />
                    {confirmPasswordTouched && (
                      <p
                        className={`text-xs ${
                          passwordsMatch ? "text-green-600" : "text-destructive"
                        }`}
                      >
                        {passwordsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Leaf className="w-4 h-4 text-primary" />
          <span>Every tree counts in the fight against climate change</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;

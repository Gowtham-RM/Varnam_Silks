import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { success, error: apiError } = await forgotPassword(email);
    setIsLoading(false);

    if (success) {
      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
    } else {
      setError(apiError || 'Something went wrong');
    }
  };

  return (
    <Layout hideFooter>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-hero py-12">
        <div className="w-full max-w-md px-4">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
            {isSubmitted ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mt-6 font-display text-2xl font-semibold">Check Your Email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    Try again
                  </button>
                </p>
                <Link to="/login" className="mt-8 inline-block">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="font-display text-2xl font-semibold">Forgot Password?</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5"
                    />
                    {error && (
                      <p className="mt-1 text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <Link
                  to="/login"
                  className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });

  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/profile' } });
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
    });

    setIsLoading(false);
    toast.success('Profile updated successfully');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">My Account</h1>
            <p className="mt-1 text-muted-foreground">Manage your profile and preferences</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="address" className="gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="max-w-xl rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Personal Information</h2>
                <div className="mt-6 space-y-5">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="mt-1.5 bg-muted"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1.5"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} variant="hero" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address">
              <div className="max-w-xl rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Shipping Address</h2>
                <div className="mt-6 space-y-5">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="mt-1.5"
                      placeholder="123 Main Street, Apt 4"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} variant="hero" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Address'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Recent Orders</h2>
                  <Link to="/orders">
                    <Button variant="link" className="text-primary">
                      View All Orders
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-muted-foreground">
                  View your order history and track deliveries
                </p>
                <Link to="/orders" className="mt-4 inline-block">
                  <Button variant="outline">View Order History</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

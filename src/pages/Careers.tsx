import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Briefcase, Users, TrendingUp, Heart } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const Careers: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
    resumeLink: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await api.post('/public/careers', formData);
      toast.success('Application submitted successfully! We\'ll review it and get back to you soon.');
      setFormData({ name: '', email: '', phone: '', position: '', experience: '', message: '', resumeLink: '' });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to submit application right now. Please try again later.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Briefcase className="h-12 w-12 text-rose-600" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Be part of a growing team that's revolutionizing ethnic fashion in India
          </p>
        </div>

        {/* Why Join Us */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-semibold text-center mb-8">Why Work With Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Growth Opportunity</h3>
                <p className="text-sm text-muted-foreground">
                  Work with a fast-growing company and advance your career
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Great Culture</h3>
                <p className="text-sm text-muted-foreground">
                  Join a supportive team that values innovation and collaboration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Work-Life Balance</h3>
                <p className="text-sm text-muted-foreground">
                  We believe in maintaining a healthy work-life balance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Competitive Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Attractive salary packages and employee benefits
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16 max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-semibold text-center mb-8">Open Positions</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Fashion Designer</h3>
                    <p className="text-sm text-muted-foreground">Full-time • Thirupur, Tamil Nadu</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">New</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  We're looking for a creative fashion designer with 3+ years of experience in ethnic wear design.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Customer Support Executive</h3>
                    <p className="text-sm text-muted-foreground">Full-time • Uthukuli, Tamil Nadu</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">New</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Join our customer support team and help us deliver exceptional service to our customers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Digital Marketing Specialist</h3>
                    <p className="text-sm text-muted-foreground">Full-time • Remote</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Drive our online presence with creative campaigns and data-driven strategies. 2+ years experience required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Warehouse Manager</h3>
                    <p className="text-sm text-muted-foreground">Full-time • Thirupur, Tamil Nadu</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Manage warehouse operations, inventory, and logistics. 5+ years of experience in warehouse management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold mb-2">Apply Now</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Don't see a position that fits? Send us your resume anyway! We're always looking for talented people.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position Applied For *</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Fashion Designer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 3 years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Cover Letter / Additional Information</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us why you'd be a great fit for our team..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumeLink">Resume Link (Google Drive/Portfolio)</Label>
                  <Input
                    id="resumeLink"
                    name="resumeLink"
                    type="url"
                    value={formData.resumeLink}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-xs text-muted-foreground">Optional, but recommended for faster review.</p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 max-w-3xl mx-auto bg-rose-50 border-rose-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-display text-lg font-semibold mb-2">Questions About Careers?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our HR team at{' '}
              <a href="mailto:careers@varnamsilks.com" className="text-rose-600 hover:underline">
                careers@varnamsilks.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Careers;

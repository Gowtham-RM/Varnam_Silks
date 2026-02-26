import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SmartInsights from '@/components/admin/SmartInsights';

const AdminAnalytics: React.FC = () => {
    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-4xl font-bold text-rose-950">Analytics</h1>
                    <p className="mt-2 text-muted-foreground">AI-driven insights and revenue forecasts</p>
                </div>
                <SmartInsights />
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;

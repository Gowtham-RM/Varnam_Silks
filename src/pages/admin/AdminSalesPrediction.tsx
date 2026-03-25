import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesPredictions } from '@/services/adminService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, TrendingUp, AlertTriangle, PackageSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SalesPredictionResponse } from '@/types';

const AdminSalesPrediction: React.FC = () => {
  const { data, isLoading, error } = useQuery<SalesPredictionResponse>({
    queryKey: ['salesPredictions'],
    queryFn: fetchSalesPredictions,
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-rose-600">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Predictions</h2>
          <p className="text-muted-foreground">There was an error fetching the sales data. Please try again later.</p>
        </div>
      </AdminLayout>
    );
  }

  // Safely aggregate data for Recharts
  const aggregated7Day = (data.predictedSales?.next7Days || []).reduce<Record<string, number>>((acc, cur) => {
    acc[cur.date] = (acc[cur.date] || 0) + cur.units;
    return acc;
  }, {});

  const chartData = Object.entries(aggregated7Day)
    .map(([date, units]) => {
      const parsed = new Date(date);
      return {
        date,
        units,
        sortTime: Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime(),
        label: Number.isNaN(parsed.getTime())
          ? date
          : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      };
    })
    .sort((a, b) => a.sortTime - b.sortTime);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Sales Prediction & AI Inventory</h1>
          <p className="text-muted-foreground">AI-driven forecasts based on historical sales data to optimize your stock.</p>
        </div>

        {/* Chart Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50">
             <CardTitle className="font-serif flex items-center gap-2 text-base sm:text-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600" /> 
                Next 7 Days Forecast (All Products)
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">Predicted units sold per day for the upcoming week.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-2 sm:px-6">
            {chartData.length > 0 ? (
               <div className="h-[250px] sm:h-[300px] w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                    />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="units" stroke="#e11d48" strokeWidth={3} name="Predicted Units" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                   No forecast data available based on current history.
                </div>
            )}
           
          </CardContent>
        </Card>

        {/* Top & Low Demand Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-4">
               <CardTitle className="font-serif text-base sm:text-lg text-emerald-700 flex items-center gap-2">
                 <PackageSearch className="h-4 w-4 sm:h-5 sm:w-5" /> High Demand Products
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Top performers driving continuous sales.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {data.topSelling && data.topSelling.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs sm:text-sm">Product</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">Total Historical Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {data.topSelling.slice(0, 5).map((item) => (
                           <TableRow key={item.productId}>
                             <TableCell>
                               <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                   <img src={item.image || 'https://placehold.co/100'} alt={item.name} className="h-full w-full object-cover" />
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={item.name}>{item.name}</span>
                                   <span className="text-xs text-muted-foreground">ID: {item.productId.slice(-6).toUpperCase()}</span>
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell className="text-right font-medium text-emerald-600">{item.totalSales} units</TableCell>
                           </TableRow>
                       ))}
                    </TableBody>
                  </Table>
               ) : (
                   <div className="p-6 text-center text-muted-foreground text-xs sm:text-sm">No sales data to determine high demand products.</div>
               )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-4">
               <CardTitle className="font-serif text-base sm:text-lg text-amber-700 flex items-center gap-2">
                 <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> Low Demand Products
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Products that may require marketing push or discounts.</CardDescription>
            </CardHeader>
             <CardContent className="p-0">
               {data.lowDemand && data.lowDemand.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs sm:text-sm">Product</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">Total Historical Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {data.lowDemand.slice(0, 5).map((item) => (
                           <TableRow key={item.productId}>
                             <TableCell>
                               <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                   <img src={item.image || 'https://placehold.co/100'} alt={item.name} className="h-full w-full object-cover" />
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={item.name}>{item.name}</span>
                                   <span className="text-xs text-muted-foreground">ID: {item.productId.slice(-6).toUpperCase()}</span>
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell className="text-right font-medium text-amber-600">{item.totalSales} units</TableCell>
                           </TableRow>
                       ))}
                    </TableBody>
                  </Table>
               ) : (
                    <div className="p-6 text-center text-muted-foreground text-xs sm:text-sm">No sales data available.</div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card className="border-slate-200 shadow-sm overflow-hidden border-rose-100">
           <CardHeader className="bg-rose-50/50 border-b border-rose-100">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                   <CardTitle className="font-serif text-base sm:text-xl text-rose-900">AI Inventory Recommendations</CardTitle>
                   <CardDescription className="text-xs sm:text-sm text-rose-700/70">Actionable insights to prevent stockouts based on next week's predicted volume.</CardDescription>
                </div>
                 <Button variant="outline" size="sm" asChild className="border-rose-200 text-rose-700 hover:bg-rose-100">
                    <Link to="/admin/analytics#stock-alerts">Manage Inventory</Link>
                 </Button>
             </div>
           </CardHeader>
           <CardContent className="p-0">
              {data.recommendations && data.recommendations.length > 0 ? (
                 <Table>
                   <TableHeader className="bg-slate-50">
                     <TableRow className="hover:bg-transparent">
                       <TableHead className="w-[30%] text-xs sm:text-sm">Product Name</TableHead>
                       <TableHead className="text-center text-xs sm:text-sm whitespace-nowrap">Expected Demand (7 Days)</TableHead>
                       <TableHead className="text-center text-xs sm:text-sm">Current Stock</TableHead>
                       <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">Suggested Restock Qty</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {data.recommendations.map((rec) => (
                       <TableRow key={rec.productId}>
                         <TableCell>
                           <div className="flex items-center gap-3">
                             <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                               <img src={rec.image || 'https://placehold.co/100'} alt={rec.name} className="h-full w-full object-cover" />
                             </div>
                             <div className="flex flex-col">
                               <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={rec.name}>{rec.name || rec.productId.slice(-6).toUpperCase()}</span>
                               <span className="text-xs text-muted-foreground">ID: {rec.productId.slice(-6).toUpperCase()}</span>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell className="text-center text-slate-600">{rec.predictedUnitsNextWeek}</TableCell>
                         <TableCell className="text-center">
                            <Badge variant="outline" className={rec.currentStock < rec.predictedUnitsNextWeek ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700'}>
                               {rec.currentStock}
                            </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                             {rec.restockQty > 0 ? (
                                <span className="inline-flex items-center justify-center font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full text-sm">
                                   +{rec.restockQty}
                                </span>
                             ) : (
                                <span className="text-emerald-600 text-sm font-medium">Adequate</span>
                             )}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
              ) : (
                 <div className="p-8 text-center text-muted-foreground text-xs sm:text-sm">No inventory recommendations at this time.</div>
              )}
           </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
};

export default AdminSalesPrediction;

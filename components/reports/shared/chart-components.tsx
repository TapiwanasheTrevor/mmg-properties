'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  mockRevenueChartData, 
  mockOccupancyChartData, 
  mockExpenseBreakdown, 
  mockPropertyComparisonData, 
  mockTenantDemographics, 
  mockMaintenanceByCategory 
} from '@/lib/data/mock-reports-data';
import { Download, Expand, Filter } from 'lucide-react';

interface ChartComponentsProps {
  title: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut';
  data: 'revenue' | 'occupancy' | 'expenses' | 'properties' | 'demographics' | 'maintenance';
  userRole: string;
  description?: string;
}

export default function ChartComponents({ 
  title, 
  type, 
  data, 
  userRole, 
  description 
}: ChartComponentsProps) {
  const getChartData = (dataType: string) => {
    switch (dataType) {
      case 'revenue': return mockRevenueChartData;
      case 'occupancy': return mockOccupancyChartData;
      case 'expenses': return mockExpenseBreakdown;
      case 'properties': return mockPropertyComparisonData;
      case 'demographics': return mockTenantDemographics;
      case 'maintenance': return mockMaintenanceByCategory;
      default: return [];
    }
  };

  const chartData = getChartData(data);
  
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: any) => [
                  data === 'revenue' ? `$${value.toLocaleString()}` : 
                  data === 'occupancy' ? `${value}%` : value, 
                  title
                ]}
                labelClassName="text-sm font-medium"
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: any) => [
                  data === 'occupancy' ? `${value}%` : value, 
                  title
                ]}
                labelClassName="text-sm font-medium"
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10B981" 
                strokeWidth={2}
                fill="#10B981" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: any) => [
                  data === 'properties' ? `${value}% ROI` : value, 
                  title
                ]}
                labelClassName="text-sm font-medium"
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={type === 'donut' ? 60 : 0}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  data === 'expenses' ? `$${value.toLocaleString()}` : value,
                  props.payload.label
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value: any, entry: any) => entry.payload.label}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="h-300 flex items-center justify-center">Chart type not supported</div>;
    }
  };

  const getInsight = () => {
    switch (data) {
      case 'revenue':
        return 'Revenue has grown 12.5% month-over-month with strong performance across all properties.';
      case 'occupancy':
        return 'Occupancy rate is trending upward with 91% current occupancy, exceeding industry average.';
      case 'expenses':
        return 'Maintenance costs represent the largest expense category, suggesting proactive management.';
      case 'properties':
        return 'Riverside Towers shows the highest ROI at 9.1%, outperforming the portfolio average.';
      case 'demographics':
        return 'Primary tenant demographic is 26-35 age group, representing 32% of total tenants.';
      case 'maintenance':
        return 'Plumbing requests dominate maintenance categories, indicating potential infrastructure upgrades.';
      default:
        return 'Data analysis provides insights for informed decision making.';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Expand className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          {renderChart()}
        </div>
        
        {(userRole === 'admin' || userRole === 'owner') && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Insight
              </Badge>
              <p className="text-sm text-muted-foreground flex-1">
                {getInsight()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
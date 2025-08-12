'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Building, 
  Users, 
  Settings, 
  User,
  DollarSign,
  Wrench,
  Crown
} from 'lucide-react';

interface RoleBasedNavigationProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function RoleBasedNavigation({ 
  userRole, 
  activeTab, 
  onTabChange 
}: RoleBasedNavigationProps) {
  const getTabsForRole = (role: string) => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Key metrics and trends' }
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseTabs,
          { 
            id: 'executive', 
            label: 'Executive', 
            icon: Crown, 
            description: 'Platform-wide analytics',
            adminOnly: true 
          },
          { 
            id: 'financial', 
            label: 'Financial', 
            icon: DollarSign, 
            description: 'Revenue and expense reports' 
          },
          { 
            id: 'properties', 
            label: 'Properties', 
            icon: Building, 
            description: 'Property performance analysis' 
          },
          { 
            id: 'tenants', 
            label: 'Tenants', 
            icon: Users, 
            description: 'Tenant analytics and demographics' 
          },
          { 
            id: 'operational', 
            label: 'Operations', 
            icon: Wrench, 
            description: 'Maintenance and operational metrics' 
          }
        ];

      case 'owner':
        return [
          ...baseTabs,
          { 
            id: 'financial', 
            label: 'Financial', 
            icon: DollarSign, 
            description: 'Income and ROI analysis' 
          },
          { 
            id: 'properties', 
            label: 'Properties', 
            icon: Building, 
            description: 'Property performance' 
          },
          { 
            id: 'tenants', 
            label: 'Tenants', 
            icon: Users, 
            description: 'Tenant reports' 
          }
        ];

      case 'agent':
        return [
          ...baseTabs,
          { 
            id: 'properties', 
            label: 'Properties', 
            icon: Building, 
            description: 'Managed properties' 
          },
          { 
            id: 'tenants', 
            label: 'Tenants', 
            icon: Users, 
            description: 'Tenant management' 
          },
          { 
            id: 'operational', 
            label: 'Operations', 
            icon: Wrench, 
            description: 'Maintenance and tasks' 
          }
        ];

      case 'tenant':
        return [
          ...baseTabs,
          { 
            id: 'personal', 
            label: 'My Reports', 
            icon: User, 
            description: 'Personal rental information' 
          }
        ];

      default:
        return baseTabs;
    }
  };

  const tabs = getTabsForRole(userRole);

  return (
    <div className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-1 h-auto p-1 bg-muted/50">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="relative flex flex-col items-center gap-2 p-4 data-[state=active]:bg-background data-[state=active]:text-foreground"
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.adminOnly && (
                <Crown className="w-3 h-3 text-amber-500" />
              )}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{tab.label}</div>
              <div className="text-xs text-muted-foreground hidden lg:block">
                {tab.description}
              </div>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Building,
  Users,
  FileText,
  Wrench,
  DollarSign,
  MessageCircle,
  Menu,
  Camera,
  MapPin,
  Clock,
} from 'lucide-react';

interface MobileNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  isPrimary?: boolean;
}

const mobileNavItems: MobileNavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['admin', 'owner', 'agent', 'tenant'],
    isPrimary: true,
  },
  {
    title: 'Properties',
    href: '/properties',
    icon: Building,
    roles: ['admin', 'owner', 'agent'],
    isPrimary: true,
  },
  {
    title: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    roles: ['admin', 'owner', 'agent', 'tenant'],
    isPrimary: true,
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageCircle,
    roles: ['admin', 'owner', 'agent', 'tenant'],
    isPrimary: true,
  },
  {
    title: 'Inspections',
    href: '/inspections',
    icon: Camera,
    roles: ['agent'],
    isPrimary: true,
  },
  {
    title: 'Tenants',
    href: '/tenants',
    icon: Users,
    roles: ['admin', 'owner', 'agent'],
  },
  {
    title: 'Financials',
    href: '/financials',
    icon: DollarSign,
    roles: ['admin', 'owner'],
  },
  {
    title: 'Leases',
    href: '/leases',
    icon: FileText,
    roles: ['admin', 'owner', 'agent'],
  },
];

// Quick actions for mobile users
const quickActions = {
  agent: [
    {
      title: 'New Inspection',
      href: '/inspections/new',
      icon: Camera,
      color: 'bg-blue-600',
    },
    {
      title: 'Check-in',
      href: '/agent/checkin',
      icon: MapPin,
      color: 'bg-green-600',
    },
  ],
  tenant: [
    {
      title: 'Report Issue',
      href: '/maintenance/new',
      icon: Wrench,
      color: 'bg-red-600',
    },
    {
      title: 'Contact Agent',
      href: '/messages/agent',
      icon: MessageCircle,
      color: 'bg-blue-600',
    },
  ],
  owner: [
    {
      title: 'Add Property',
      href: '/properties/new',
      icon: Building,
      color: 'bg-green-600',
    },
    {
      title: 'View Reports',
      href: '/reports',
      icon: DollarSign,
      color: 'bg-blue-600',
    },
  ],
  admin: [
    {
      title: 'Analytics',
      href: '/analytics',
      icon: Building,
      color: 'bg-purple-600',
    },
    {
      title: 'System Status',
      href: '/admin/status',
      icon: Clock,
      color: 'bg-green-600',
    },
  ],
};

export default function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const filteredNavItems = mobileNavItems.filter(item =>
    item.roles.includes(user.role)
  );

  const primaryItems = filteredNavItems.filter(item => item.isPrimary);
  const secondaryItems = filteredNavItems.filter(item => !item.isPrimary);

  const userQuickActions = quickActions[user.role as keyof typeof quickActions] || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-green-100 text-green-800';
      case 'tenant':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {primaryItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center justify-center h-14 w-full rounded-lg text-xs ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                  <span className="truncate w-full text-center">{item.title}</span>
                </Button>
              </Link>
            );
          })}

          {/* More Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center h-14 w-full rounded-lg text-xs text-gray-600"
              >
                <Menu className="h-5 w-5 mb-1" />
                <span>More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* User Profile */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-6">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profile?.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.profile?.firstName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                      {user.profile?.lastName?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {user.profile?.firstName || 'No name'} {user.profile?.lastName || ''}
                    </p>
                    <Badge variant="secondary" className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Quick Actions */}
                {userQuickActions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {userQuickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Link key={action.href} href={action.href} onClick={() => setIsOpen(false)}>
                            <Button className={`w-full ${action.color} hover:opacity-90`}>
                              <Icon className="h-4 w-4 mr-2" />
                              {action.title}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Navigation Items */}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
                  <nav className="space-y-1">
                    {filteredNavItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      const Icon = item.icon;

                      return (
                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={`w-full justify-start ${
                              isActive ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {item.title}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Profile Link */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Profile Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">MMG Properties</span>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
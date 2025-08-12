'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Building,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  MessageCircle,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['admin', 'owner', 'agent', 'tenant'],
  },
  {
    title: 'Properties',
    href: '/properties',
    icon: Building,
    roles: ['admin', 'owner', 'agent'],
  },
  {
    title: 'Units',
    href: '/units',
    icon: BarChart3,
    roles: ['admin', 'owner', 'agent'],
  },
  {
    title: 'Tenants',
    href: '/tenants',
    icon: Users,
    roles: ['admin', 'owner', 'agent'],
  },
  {
    title: 'Leases',
    href: '/leases',
    icon: FileText,
    roles: ['admin', 'owner', 'agent'],
  },
  {
    title: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    roles: ['admin', 'owner', 'agent', 'tenant'],
  },
  {
    title: 'Financials',
    href: '/financials',
    icon: DollarSign,
    roles: ['admin', 'owner'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'owner'],
  },
  {
    title: 'Schedule',
    href: '/schedule',
    icon: Calendar,
    roles: ['admin', 'agent'],
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageCircle,
    roles: ['admin', 'owner', 'agent', 'tenant'],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'owner':
        return 'Property Owner';
      case 'agent':
        return 'Agent';
      case 'tenant':
        return 'Tenant';
      default:
        return role;
    }
  };

  if (!user) return null;

  return (
    <div
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">MMG</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profile?.avatar} />
                  <AvatarFallback>
                    {user.profile?.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    {user.profile?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                      {user.profile?.firstName || user.email?.split('@')[0] || 'User'} {user.profile?.lastName || ''}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getRoleColor(user.role)}`}
                    >
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  collapsed ? 'px-2' : 'px-3'
                } ${isActive ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 MMG Property Consultancy
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Bell,
  Plus,
  MessageCircle,
  Settings,
  LogOut,
  User,
  Building,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import NotificationBell from '@/components/notifications/notification-bell';

interface AppHeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

export default function AppHeader({ title, actions }: AppHeaderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const getQuickActions = () => {
    if (!user) return [];

    const actions = [];
    
    switch (user.role) {
      case 'admin':
      case 'owner':
        actions.push(
          { label: 'Add Property', href: '/properties/new', icon: Building },
          { label: 'Add Tenant', href: '/tenants/new', icon: Users },
          { label: 'New Maintenance', href: '/maintenance/new', icon: Wrench }
        );
        break;
      case 'agent':
        actions.push(
          { label: 'Add Tenant', href: '/tenants/new', icon: Users },
          { label: 'New Maintenance', href: '/maintenance/new', icon: Wrench }
        );
        break;
      case 'tenant':
        actions.push(
          { label: 'Request Maintenance', href: '/maintenance/new', icon: Wrench }
        );
        break;
    }
    
    return actions;
  };

  const quickActions = getQuickActions();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Search */}
        <div className="flex items-center space-x-4 flex-1">
          {title && (
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          )}
          
          <div className="max-w-md w-full">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search properties, tenants, requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </form>
          </div>
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Custom Actions */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickActions.map((action) => (
                  <DropdownMenuItem key={action.href} asChild>
                    <Link href={action.href}>
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Notifications */}
          <NotificationBell />

          {/* Messages */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" asChild>
            <Link href="/messages">
              <MessageCircle className="h-4 w-4" />
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={user.profile.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.profile.firstName.charAt(0)}
                    {user.profile.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">
                  {user.profile.firstName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <div className="font-medium">
                    {user.profile.firstName} {user.profile.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
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
      </div>
    </header>
  );
}
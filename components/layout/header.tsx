"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, User, LogOut } from "lucide-react"

interface HeaderProps {
  userRole: "admin" | "owner" | "agent" | "tenant"
  onRoleChange: (role: "admin" | "owner" | "agent" | "tenant") => void
}

export function Header({ userRole, onRoleChange }: HeaderProps) {
  const getRoleDisplay = () => {
    switch (userRole) {
      case "admin":
        return { label: "System Administrator", color: "bg-red-100 text-red-800" }
      case "owner":
        return { label: "Property Owner", color: "bg-blue-100 text-blue-800" }
      case "agent":
        return { label: "Property Agent", color: "bg-green-100 text-green-800" }
      case "tenant":
        return { label: "Tenant", color: "bg-purple-100 text-purple-800" }
    }
  }

  const roleDisplay = getRoleDisplay()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <Badge className={roleDisplay.color}>{roleDisplay.label}</Badge>
        </div>

        <div className="flex items-center space-x-4">
          {/* Role Switcher for Demo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Switch Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onRoleChange("admin")}>Admin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("owner")}>Owner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("agent")}>Agent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("tenant")}>Tenant</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 text-xs">
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">john@mmg.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

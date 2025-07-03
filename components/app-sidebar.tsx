"use client"

import type * as React from "react"
import { Building2, Home, MessageSquare, Bell, Plus, Settings, User, ChevronUp, LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

// Menu items
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Properties",
      items: [
        {
          title: "Vacant Units",
          url: "/vacant-units",
          icon: Home,
        },
        {
          title: "Add New Unit",
          url: "/new-vacant-unit",
          icon: Plus,
        },
        {
          title: "Buildings",
          url: "/buildings",
          icon: Building2,
        },
        {
          title: "Add Building",
          url: "/new-building",
          icon: Plus,
        },
      ],
    },
    {
      title: "Communications",
      items: [
        {
          title: "Inquiries",
          url: "/inquiries",
          icon: MessageSquare,
        },
        {
          title: "Notices",
          url: "/notices",
          icon: Bell,
        },
      ],
    },
    {
      title: "Services",
      items: [
        {
          title: "Request Move",
          url: "/request-move",
          icon: Home,
        },
      ],
    },
    {
      title: "Admin",
      items: [
        {
          title: "Admin Panel",
          url: "/admin",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white shadow-sm" {...props}>
      <SidebarHeader className="border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 px-2 py-2">
          <Building2 className="h-6 w-6 text-green-600" />
          <span className="font-semibold text-gray-900">Swyft Agent</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="text-gray-600 font-medium">{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.url ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-green-50 hover:text-green-700 data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  item.items?.map((subItem) => (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton
                        asChild
                        className="hover:bg-green-50 hover:text-green-700 data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                      >
                        <Link href={subItem.url}>
                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-green-50 data-[state=open]:text-green-700 hover:bg-green-50 hover:text-green-700"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-gray-900">
                      {user?.user_metadata?.full_name || user?.email || "User"}
                    </span>
                    <span className="truncate text-xs text-gray-500">{user?.email || "user@example.com"}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-gray-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white border border-gray-200 shadow-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild className="hover:bg-green-50">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="hover:bg-red-50 text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

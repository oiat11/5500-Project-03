import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "./ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Users, Calendar, Settings, LogOut } from "lucide-react" 
import { signOut } from "../redux/auth/authSlice"

export function AppSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  
  const menuItems = [
    {
      title: "Donors",
      href: "/donors",
      icon: Users
    },
    {
      title: "Events",
      href: "/events",
      icon: Calendar
    }
  ];

  const handleLogout = () => {
    dispatch(signOut());
  };

  return (
    <Sidebar>
      <SidebarHeader className="pt-6">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
            <AvatarFallback className="rounded-lg">
              {currentUser?.username?.slice(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{currentUser?.username}</span>
            <span className="truncate text-xs text-muted-foreground">{currentUser?.email}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="mt-6">
        <SidebarGroup>
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
                location.pathname === item.href ? 'bg-gray-100 text-gray-900' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <div className="flex flex-col gap-2 px-2">
          <Link
            to="/settings"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
              location.pathname === '/settings' ? 'bg-gray-100 text-gray-900' : ''
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
        <div className="mt-4 px-2">
          <p className="text-xs text-gray-500 text-center">© 2025 Donor List Automation System</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 
"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
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
import { Bell, LayoutDashboard, LogOut, Users, Shield } from "lucide-react"
import { useNotifications } from "@/components/notification-provider"

export default function Header() {
  const { data: session, status } = useSession()
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()

  // Prevent hydration mismatch by not rendering until client-side
  if (status === "loading") {
    return (
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            SkillSwap
          </Link>
          <nav className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="text-2xl font-bold text-primary">
          SkillSwap
        </Link>
        <nav className="flex items-center gap-4">
          {status === "authenticated" ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    {notifications.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAll}>
                        Clear All
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 10).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex flex-col items-start p-4 cursor-pointer ${
                            !notification.read ? "bg-muted/50" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start w-full">
                            <div className="font-medium">{notification.title}</div>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{notification.message}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {notification.createdAt.toLocaleTimeString()}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image || `https://avatar.vercel.sh/${session.user?.email}.png`}
                        alt={session.user?.name || "User"}
                      />
                      <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      {session.user?.role === "admin" && (
                        <Badge variant="default" className="w-fit text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/browse">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Browse</span>
                    </Link>
                  </DropdownMenuItem>
                  {session.user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

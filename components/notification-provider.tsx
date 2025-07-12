"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { io, type Socket } from "socket.io-client"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  clearAll: () => void
}

interface Notification {
  id: string
  type: "swap_request" | "message" | "swap_accepted"
  title: string
  message: string
  read: boolean
  createdAt: Date
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (session?.user?.email && process.env.NEXT_PUBLIC_SOCKET_URL) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL)
      setSocket(newSocket)

      // Join user to their room
      newSocket.emit("addUser", session.user.email)

      // Listen for swap notifications
      newSocket.on("getSwapNotification", (data: { senderName: string; message: string }) => {
        const notification: Notification = {
          id: Date.now().toString(),
          type: "swap_request",
          title: "New Swap Request",
          message: data.message,
          read: false,
          createdAt: new Date(),
        }

        setNotifications((prev) => [notification, ...prev])
        toast({
          title: notification.title,
          description: notification.message,
        })
      })

      // Listen for messages
      newSocket.on("getMessage", (data: { senderId: string; text: string }) => {
        const notification: Notification = {
          id: Date.now().toString(),
          type: "message",
          title: "New Message",
          message: `You have a new message: ${data.text.substring(0, 50)}...`,
          read: false,
          createdAt: new Date(),
        }

        setNotifications((prev) => [notification, ...prev])
        toast({
          title: notification.title,
          description: notification.message,
        })
      })

      return () => {
        newSocket.close()
      }
    }
  }, [session, toast])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

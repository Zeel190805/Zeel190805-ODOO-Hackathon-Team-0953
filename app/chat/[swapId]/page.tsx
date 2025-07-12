"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { io, type Socket } from "socket.io-client"

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  content: string
  createdAt: string
}

interface SwapRequest {
  _id: string
  fromUser: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  toUser: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  offeredSkill: string
  requestedSkill: string
  status: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const params = useParams()
  const swapId = params.swapId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [swapRequest, setSwapRequest] = useState<SwapRequest | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user?.email && process.env.NEXT_PUBLIC_SOCKET_URL) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL)
      setSocket(newSocket)

      // Join user to their room
      newSocket.emit("addUser", session.user.email)

      // Listen for messages
      newSocket.on("getMessage", (data: { senderId: string; text: string }) => {
        const newMsg: Message = {
          _id: Date.now().toString(),
          sender: {
            _id: data.senderId,
            name: "Other User",
            email: data.senderId,
          },
          content: data.text,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, newMsg])
      })

      return () => {
        newSocket.close()
      }
    }
  }, [session])

  useEffect(() => {
    if (swapId) {
      fetchSwapRequest()
      fetchMessages()
    }
  }, [swapId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchSwapRequest = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockSwapRequest: SwapRequest = {
        _id: swapId,
        fromUser: {
          _id: "1",
          name: "Marc Deco",
          email: "marc@example.com",
          profileImage: "/placeholder.svg?height=100&width=100",
        },
        toUser: {
          _id: "2",
          name: "You",
          email: session?.user?.email || "",
          profileImage: session?.user?.image || "",
        },
        offeredSkill: "React",
        requestedSkill: "Python",
        status: "accepted",
      }
      setSwapRequest(mockSwapRequest)
    } catch (error) {
      console.error("Error fetching swap request:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      // Mock messages for now - replace with actual API call
      const mockMessages: Message[] = [
        {
          _id: "1",
          sender: {
            _id: "1",
            name: "Marc Deco",
            email: "marc@example.com",
            profileImage: "/placeholder.svg?height=100&width=100",
          },
          content: "Hi! I'm excited to start our skill swap. When would be a good time for you?",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: "2",
          sender: {
            _id: "2",
            name: "You",
            email: session?.user?.email || "",
            profileImage: session?.user?.image || "",
          },
          content: "Hello! I'm available this weekend. How about Saturday afternoon?",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !swapRequest) return

    const otherUser = swapRequest.fromUser.email === session?.user?.email ? swapRequest.toUser : swapRequest.fromUser

    // Send message via socket
    socket.emit("sendMessage", {
      senderId: session?.user?.email,
      receiverId: otherUser.email,
      text: newMessage,
    })

    // Add message to local state
    const message: Message = {
      _id: Date.now().toString(),
      sender: {
        _id: session?.user?.email || "",
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        profileImage: session?.user?.image || "",
      },
      content: newMessage,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Here you would also save the message to your database
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swapId,
          content: newMessage,
          receiverId: otherUser._id,
        }),
      })
    } catch (error) {
      console.error("Error saving message:", error)
    }
  }

  if (loading) {
    return <div>Loading chat...</div>
  }

  if (!swapRequest) {
    return <div>Swap request not found</div>
  }

  const otherUser = swapRequest.fromUser.email === session?.user?.email ? swapRequest.toUser : swapRequest.fromUser

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href="/swaps">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Swaps
          </Link>
        </Button>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.profileImage || `https://avatar.vercel.sh/${otherUser.email}.png`} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUser.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Swapping {swapRequest.offeredSkill} ↔ {swapRequest.requestedSkill}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender.email === session?.user?.email
                return (
                  <div key={message._id} className={cn("flex gap-3", isOwnMessage ? "justify-end" : "justify-start")}>
                    {!isOwnMessage && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={message.sender.profileImage || `https://avatar.vercel.sh/${message.sender.email}.png`}
                        />
                        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[70%]",
                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(message.createdAt).toLocaleTimeString()}</p>
                    </div>
                    {isOwnMessage && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={message.sender.profileImage || `https://avatar.vercel.sh/${message.sender.email}.png`}
                        />
                        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t">
          <form onSubmit={sendMessage} className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

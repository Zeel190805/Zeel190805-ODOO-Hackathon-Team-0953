"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, MessageCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

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
  message?: string
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  createdAt: string
}

const SwapRequestCard = ({
  request,
  type,
  onAccept,
  onReject,
  onDelete,
  onOpenChat,
}: {
  request: SwapRequest
  type: "received" | "sent"
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
  onOpenChat: (id: string) => void
}) => {
  const otherUser = type === "received" ? request.fromUser : request.toUser

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    accepted: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.profileImage || `https://avatar.vercel.sh/${otherUser.email}.png`} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUser.name}</CardTitle>
              <CardDescription>{type === "received" ? "Wants to swap with you" : "You sent a request"}</CardDescription>
            </div>
          </div>
          <Badge className={`capitalize ${statusColors[request.status]}`}>{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4 text-center mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{type === "received" ? "They Offer" : "You Offer"}</p>
            <Badge variant="secondary">{type === "received" ? request.offeredSkill : request.offeredSkill}</Badge>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">{type === "received" ? "They Want" : "You Want"}</p>
            <Badge variant="secondary">{type === "received" ? request.requestedSkill : request.requestedSkill}</Badge>
          </div>
        </div>
        {request.message && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">{request.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {type === "received" && request.status === "pending" && (
          <>
            <Button variant="outline" onClick={() => onReject(request._id)}>
              Reject
            </Button>
            <Button onClick={() => onAccept(request._id)}>Accept</Button>
          </>
        )}
        {request.status === "accepted" && (
          <Button variant="outline" onClick={() => onOpenChat(request._id)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Open Chat
          </Button>
        )}
        {(request.status === "rejected" || (type === "sent" && request.status === "pending")) && (
          <Button variant="destructive" onClick={() => onDelete(request._id)}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

const SwapRequestSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center gap-4 text-center mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-16 w-full" />
    </CardContent>
    <CardFooter>
      <div className="flex justify-end gap-2 w-full">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </CardFooter>
  </Card>
)

export default function SwapsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [requests, setRequests] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchSwapRequests()
    }
  }, [session])

  const fetchSwapRequests = async () => {
    try {
      const response = await fetch("/api/swaps")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        throw new Error("Failed to fetch swap requests")
      }
    } catch (error) {
      console.error("Error fetching swap requests:", error)
      toast({
        title: "Error",
        description: "Failed to load swap requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSwapRequest = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/swaps/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchSwapRequests() // Refresh the list
        toast({
          title: "Success",
          description: `Request ${status} successfully`,
        })
      } else {
        throw new Error(`Failed to ${status} request`)
      }
    } catch (error) {
      console.error(`Error updating request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} request`,
        variant: "destructive",
      })
    }
  }

  const deleteSwapRequest = async (id: string) => {
    try {
      const response = await fetch(`/api/swaps/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchSwapRequests() // Refresh the list
        toast({
          title: "Success",
          description: "Request deleted successfully",
        })
      } else {
        throw new Error("Failed to delete request")
      }
    } catch (error) {
      console.error("Error deleting request:", error)
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      })
    }
  }

  const handleAccept = (id: string) => updateSwapRequest(id, "accepted")
  const handleReject = (id: string) => updateSwapRequest(id, "rejected")
  const handleDelete = (id: string) => deleteSwapRequest(id)
  const handleOpenChat = (id: string) => {
    // Navigate to chat page
    window.location.href = `/chat/${id}`
  }

  const receivedRequests = requests.filter((req) => req.toUser.email === session?.user?.email)
  const sentRequests = requests.filter((req) => req.fromUser.email === session?.user?.email)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Swap Requests</h1>
      <Tabs defaultValue="received" className="w-full">
        <TabsList>
          <TabsTrigger value="received">Received ({receivedRequests.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-4 space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <SwapRequestSkeleton key={i} />)
          ) : receivedRequests.length > 0 ? (
            receivedRequests.map((req) => (
              <SwapRequestCard
                key={req._id}
                request={req}
                type="received"
                onAccept={handleAccept}
                onReject={handleReject}
                onDelete={handleDelete}
                onOpenChat={handleOpenChat}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No received requests.</p>
          )}
        </TabsContent>
        <TabsContent value="sent" className="mt-4 space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <SwapRequestSkeleton key={i} />)
          ) : sentRequests.length > 0 ? (
            sentRequests.map((req) => (
              <SwapRequestCard
                key={req._id}
                request={req}
                type="sent"
                onAccept={handleAccept}
                onReject={handleReject}
                onDelete={handleDelete}
                onOpenChat={handleOpenChat}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">You haven't sent any requests.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

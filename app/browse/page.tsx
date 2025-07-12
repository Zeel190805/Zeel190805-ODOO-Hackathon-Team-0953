"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { IUser } from "@/models/user"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ArrowRight, MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { SwapRequestModal } from "@/components/swap-request-modal"
import { CourseRequestModal } from "@/components/course-request-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Users will be fetched from the database

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

interface CourseRequest {
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
  courseName: string
  courseDescription: string
  requestedSkill: string
  message?: string
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  createdAt: string
}

const SwapRequestCard = ({ request, onAccept, onReject }: { 
  request: SwapRequest; 
  onAccept: (id: string) => void; 
  onReject: (id: string) => void; 
}) => {
  const otherUser = request.fromUser

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
              <p className="text-sm text-muted-foreground">Wants to swap with you</p>
            </div>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4 text-center mb-4">
          <div>
            <p className="text-sm text-muted-foreground">They Offer</p>
            <Badge variant="secondary">{request.offeredSkill}</Badge>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">They Want</p>
            <Badge variant="secondary">{request.requestedSkill}</Badge>
          </div>
        </div>
        {request.message && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">{request.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onReject(request._id)}>
          Reject
        </Button>
        <Button onClick={() => onAccept(request._id)}>
          Accept
        </Button>
      </CardFooter>
    </Card>
  )
}

const CourseRequestCard = ({ request, onAccept, onReject }: { 
  request: CourseRequest; 
  onAccept: (id: string) => void; 
  onReject: (id: string) => void; 
}) => {
  const otherUser = request.fromUser

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
              <p className="text-sm text-muted-foreground">Wants to learn from you</p>
            </div>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">{request.courseName}</h4>
          <p className="text-sm text-muted-foreground mb-2">{request.courseDescription}</p>
          <div className="text-sm">Skill: <Badge variant="secondary">{request.requestedSkill}</Badge></div>
        </div>
        {request.message && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">{request.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onReject(request._id)}>
          Reject
        </Button>
        <Button onClick={() => onAccept(request._id)}>
          Accept
        </Button>
      </CardFooter>
    </Card>
  )
}

const UserCard = ({ user, onRequestSwap, onRequestCourse }: { 
  user: IUser; 
  onRequestSwap: (user: IUser) => void;
  onRequestCourse: (user: IUser) => void;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.profileImage || "/placeholder.svg"} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <CardTitle>{user.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{user.location}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{user.rating.average.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({user.rating.count} ratings)</span>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div>
        <h4 className="font-semibold mb-2">Skills Offered</h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsOffered.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Skills Wanted</h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsWanted.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Availability: {user.availability}</p>
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          onClick={() => onRequestCourse(user)}
          className="flex-1"
        >
          Request Course
        </Button>
        <Button 
          onClick={() => onRequestSwap(user)}
          className="flex-1"
        >
          Request Swap
        </Button>
      </div>
    </CardFooter>
  </Card>
)

const UserCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-between items-center">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-32" />
    </CardFooter>
  </Card>
)

export default function BrowsePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [users, setUsers] = useState<IUser[]>([])
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([])
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [courseRequestsLoading, setCourseRequestsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [availability, setAvailability] = useState("all")
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [courseModalOpen, setCourseModalOpen] = useState(false)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          // Filter users based on search term and availability
          const filteredUsers = data
            .filter(
              (user: IUser) =>
                user.skillsOffered.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .filter((user: IUser) => availability === "all" || user.availability?.toLowerCase() === availability.toLowerCase())
          setUsers(filteredUsers)
        } else {
          throw new Error("Failed to fetch users")
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [searchTerm, availability, toast])

  // Fetch swap requests
  useEffect(() => {
    const fetchSwapRequests = async () => {
      if (!session?.user?.email) return
      
      setRequestsLoading(true)
      try {
        const response = await fetch("/api/swaps")
        if (response.ok) {
          const data = await response.json()
          console.log("All swap requests:", data)
          console.log("Current user email:", session.user?.email)
          // Filter only received pending requests
          const receivedRequests = data.filter((req: SwapRequest) => 
            req.toUser?.email === session.user?.email && req.status === "pending"
          )
          console.log("Filtered swap requests:", receivedRequests)
          setSwapRequests(receivedRequests)
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
        setRequestsLoading(false)
      }
    }

    fetchSwapRequests()
  }, [session?.user?.email, toast])

  // Fetch course requests
  useEffect(() => {
    const fetchCourseRequests = async () => {
      if (!session?.user?.email) return
      
      setCourseRequestsLoading(true)
      try {
        const response = await fetch("/api/course-requests")
        if (response.ok) {
          const data = await response.json()
          // Filter only received pending requests
          const receivedRequests = data.filter((req: CourseRequest) => 
            req.toUser?.email === session.user?.email && req.status === "pending"
          )
          setCourseRequests(receivedRequests)
        } else {
          throw new Error("Failed to fetch course requests")
        }
      } catch (error) {
        console.error("Error fetching course requests:", error)
        toast({
          title: "Error",
          description: "Failed to load course requests",
          variant: "destructive",
        })
      } finally {
        setCourseRequestsLoading(false)
      }
    }

    fetchCourseRequests()
  }, [session?.user?.email, toast])

  const handleRequestSwap = (user: IUser) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send swap requests.",
        variant: "destructive",
      })
      return
    }
    setSelectedUser(user)
    setModalOpen(true)
  }

  const handleRequestCourse = (user: IUser) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send course requests.",
        variant: "destructive",
      })
      return
    }
    setSelectedUser(user)
    setCourseModalOpen(true)
  }

  const handleSwapRequestSubmit = async (requestData: any) => {
    try {
      const requestBody = {
        toUserId: selectedUser?._id,
        ...requestData,
      }
      console.log("Sending swap request:", requestBody)
      
      const response = await fetch("/api/swaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast({
          title: "Request Sent",
          description: `Swap request sent to ${selectedUser?.name}!`,
        })
        setModalOpen(false)
        // Refresh the swap requests list
        const requestsResponse = await fetch("/api/swaps")
        if (requestsResponse.ok) {
          const data = await requestsResponse.json()
          const receivedRequests = data.filter((req: SwapRequest) => 
            req.toUser?.email === session?.user?.email && req.status === "pending"
          )
          setSwapRequests(receivedRequests)
        }
      } else {
        const errorText = await response.text()
        throw new Error(errorText)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send swap request",
        variant: "destructive",
      })
    }
  }

  const updateSwapRequest = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/swaps/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Remove the request from the list
        setSwapRequests(prev => prev.filter(req => req._id !== id))
        toast({
          title: "Success",
          description: `Request ${status} successfully`,
        })
      } else {
        throw new Error(`Failed to ${status} request`)
      }
    } catch (error: any) {
      console.error(`Error updating request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} request`,
        variant: "destructive",
      })
    }
  }

  const updateCourseRequest = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/course-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Remove the request from the list
        setCourseRequests(prev => prev.filter(req => req._id !== id))
        toast({
          title: "Success",
          description: `Course request ${status} successfully`,
        })
      } else {
        throw new Error(`Failed to ${status} course request`)
      }
    } catch (error: any) {
      console.error(`Error updating course request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} course request`,
        variant: "destructive",
      })
    }
  }

  const handleAccept = (id: string) => updateSwapRequest(id, "accepted")
  const handleReject = (id: string) => updateSwapRequest(id, "rejected")

  const handleCourseRequestSubmit = async (requestData: any) => {
    try {
      const response = await fetch("/api/course-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: selectedUser?._id,
          ...requestData,
        }),
      })

      if (response.ok) {
        toast({
          title: "Request Sent",
          description: `Course request sent to ${selectedUser?.name}!`,
        })
        setCourseModalOpen(false)
        // Refresh the course requests list
        const requestsResponse = await fetch("/api/course-requests")
        if (requestsResponse.ok) {
          const data = await requestsResponse.json()
          const receivedRequests = data.filter((req: CourseRequest) => 
            req.toUser.email === session?.user?.email && req.status === "pending"
          )
          setCourseRequests(receivedRequests)
        }
      } else {
        const errorText = await response.text()
        throw new Error(errorText)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send course request",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Users</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Skill Requests
            {swapRequests.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {swapRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="course-requests" className="relative">
            Course Requests
            {courseRequests.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {courseRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <div className="mb-8 p-4 bg-card rounded-lg border">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by skill or name..."
                className="flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availabilities</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="evenings">Evenings</SelectItem>
                  <SelectItem value="anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <UserCardSkeleton key={i} />)
              : users.map((user) => <UserCard key={user._id as string} user={user} onRequestSwap={handleRequestSwap} onRequestCourse={handleRequestCourse} />)}
          </div>

          {!loading && users.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Skill Swap Requests</h2>
            <p className="text-muted-foreground">
              Review and respond to skill swap requests from other users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestsLoading
              ? Array.from({ length: 3 }).map((_, i) => <UserCardSkeleton key={i} />)
              : swapRequests.length > 0
              ? swapRequests.map((request) => (
                  <SwapRequestCard
                    key={request._id}
                    request={request}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))
              : (
                  <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>No pending skill swap requests.</p>
                  </div>
                )}
          </div>
        </TabsContent>

        <TabsContent value="course-requests" className="mt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Course Requests</h2>
            <p className="text-muted-foreground">
              Review and respond to course requests from students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseRequestsLoading
              ? Array.from({ length: 3 }).map((_, i) => <UserCardSkeleton key={i} />)
              : courseRequests.length > 0
              ? courseRequests.map((request) => (
                  <CourseRequestCard
                    key={request._id}
                    request={request}
                    onAccept={(id) => updateCourseRequest(id, "accepted")}
                    onReject={(id) => updateCourseRequest(id, "rejected")}
                  />
                ))
              : (
                  <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>No pending course requests.</p>
                  </div>
                )}
          </div>
        </TabsContent>
      </Tabs>

      <SwapRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        targetUser={selectedUser}
        onSubmit={handleSwapRequestSubmit}
      />
      <CourseRequestModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        targetUser={selectedUser}
        onSubmit={handleCourseRequestSubmit}
      />
    </div>
  )
}

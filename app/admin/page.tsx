"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Ban, 
  UserCheck, 
  AlertTriangle,
  Info,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin"
  isBanned: boolean
  banReason?: string
  bannedAt?: string
  bannedBy?: string
  createdAt: string
  profileImage?: string
}

interface PlatformMessage {
  _id: string
  title: string
  content: string
  type: "info" | "warning" | "alert" | "update"
  isActive: boolean
  createdAt: string
  createdBy: string
  expiresAt?: string
}

interface Report {
  users: {
    total: number
    active: number
    banned: number
    admins: number
    recent: number
  }
  swaps: {
    total: number
    pending: number
    accepted: number
    completed: number
    cancelled: number
    recent: number
  }
  courseRequests: {
    total: number
    pending: number
    accepted: number
    completed: number
    cancelled: number
    recent: number
  }
  enrollments: {
    total: number
    active: number
    completed: number
    recent: number
  }
  messages: {
    total: number
    active: number
  }
  topSkills: Array<{ skill: string; count: number }>
  generatedAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<PlatformMessage[]>([])
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banReason, setBanReason] = useState("")
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    type: "info" as const,
    expiresAt: ""
  })

  useEffect(() => {
    if (status === "authenticated") {
      checkAdminAccess()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/users/profile")
      if (response.ok) {
        const user = await response.json()
        if (user.role !== "admin") {
          router.push("/dashboard")
          toast({
            title: "Access Denied",
            description: "Admin access required",
            variant: "destructive",
          })
          return
        }
        fetchData()
      }
    } catch (error) {
      console.error("Error checking admin access:", error)
    }
  }

  const fetchData = async () => {
    try {
      const [usersRes, messagesRes, reportRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/messages"),
        fetch("/api/admin/reports")
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (messagesRes.ok) setMessages(await messagesRes.json())
      if (reportRes.ok) setReport(await reportRes.json())
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, reason?: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(user => user._id === userId ? updatedUser : user))
        toast({
          title: "Success",
          description: `User ${action === "ban" ? "banned" : action === "unban" ? "unbanned" : action === "makeAdmin" ? "made admin" : "admin role removed"} successfully`,
        })
        setSelectedUser(null)
        setBanReason("")
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleCreateMessage = async () => {
    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages([message, ...messages])
        setNewMessage({ title: "", content: "", type: "info", expiresAt: "" })
        toast({
          title: "Success",
          description: "Platform message created successfully",
        })
      } else {
        throw new Error("Failed to create message")
      }
    } catch (error) {
      console.error("Error creating message:", error)
      toast({
        title: "Error",
        description: "Failed to create message",
        variant: "destructive",
      })
    }
  }

  const handleToggleMessage = async (messageId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, isActive }),
      })

      if (response.ok) {
        const updatedMessage = await response.json()
        setMessages(messages.map(msg => msg._id === messageId ? updatedMessage : msg))
        toast({
          title: "Success",
          description: `Message ${isActive ? "activated" : "deactivated"} successfully`,
        })
      } else {
        throw new Error("Failed to update message")
      }
    } catch (error) {
      console.error("Error updating message:", error)
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages?id=${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessages(messages.filter(msg => msg._id !== messageId))
        toast({
          title: "Success",
          description: "Message deleted successfully",
        })
      } else {
        throw new Error("Failed to delete message")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const downloadReport = () => {
    if (!report) return
    
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `admin-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading admin panel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage users, messages, and platform statistics</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.users.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.users.recent} new this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.users.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.users.banned} banned
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.swaps.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.swaps.pending} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Course Requests</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.courseRequests.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.courseRequests.pending} pending
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {report && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                  <CardDescription>Most popular skills on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.topSkills.map((skill, index) => (
                      <div key={skill.skill} className="flex items-center justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <Badge variant="secondary">{skill.count} users</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Activity in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>New Users</span>
                      <Badge variant="outline">{report.users.recent}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New Swaps</span>
                      <Badge variant="outline">{report.swaps.recent}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New Course Requests</span>
                      <Badge variant="outline">{report.courseRequests.recent}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New Enrollments</span>
                      <Badge variant="outline">{report.enrollments.recent}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and bans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                          {user.isBanned && (
                            <Badge variant="destructive">Banned</Badge>
                          )}
                        </div>
                        {user.isBanned && user.banReason && (
                          <div className="text-sm text-red-600 mt-1">
                            Reason: {user.banReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!user.isBanned ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Ban className="h-4 w-4 mr-1" />
                              Ban
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ban User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to ban {user.name}? This action can be reversed.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="banReason">Reason for ban</Label>
                                <Textarea
                                  id="banReason"
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                  placeholder="Enter reason for banning this user..."
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setBanReason("")}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleUserAction(user._id, "ban", banReason)}
                                >
                                  Ban User
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user._id, "unban")}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      )}
                      
                      {user.role === "user" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user._id, "makeAdmin")}
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user._id, "removeAdmin")}
                        >
                          Remove Admin
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Platform Messages</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Platform Message</DialogTitle>
                  <DialogDescription>
                    Send a message to all users on the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newMessage.title}
                      onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                      placeholder="Enter message title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      placeholder="Enter message content..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Message Type</Label>
                    <Select
                      value={newMessage.type}
                      onValueChange={(value: any) => setNewMessage({ ...newMessage, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={newMessage.expiresAt}
                      onChange={(e) => setNewMessage({ ...newMessage, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNewMessage({ title: "", content: "", type: "info", expiresAt: "" })}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMessage}>
                      Create Message
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Messages</CardTitle>
              <CardDescription>Manage platform-wide messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        message.type === "info" ? "bg-blue-100 text-blue-600" :
                        message.type === "warning" ? "bg-yellow-100 text-yellow-600" :
                        message.type === "alert" ? "bg-red-100 text-red-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {message.type === "info" && <Info className="h-4 w-4" />}
                        {message.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                        {message.type === "alert" && <AlertTriangle className="h-4 w-4" />}
                        {message.type === "update" && <Info className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{message.title}</div>
                        <div className="text-sm text-gray-500">{message.content}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created by {message.createdBy} on {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={message.isActive}
                          onCheckedChange={(checked) => handleToggleMessage(message._id, checked)}
                        />
                        <span className="text-sm">{message.isActive ? "Active" : "Inactive"}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMessage(message._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No platform messages found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <Button onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>

          {report && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-bold">{report.users.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Users</span>
                      <span className="font-bold text-green-600">{report.users.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Banned Users</span>
                      <span className="font-bold text-red-600">{report.users.banned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin Users</span>
                      <span className="font-bold text-blue-600">{report.users.admins}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Swap Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Swaps</span>
                      <span className="font-bold">{report.swaps.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span className="font-bold text-yellow-600">{report.swaps.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accepted</span>
                      <span className="font-bold text-green-600">{report.swaps.accepted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-bold text-blue-600">{report.swaps.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled</span>
                      <span className="font-bold text-red-600">{report.swaps.cancelled}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Request Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Requests</span>
                      <span className="font-bold">{report.courseRequests.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span className="font-bold text-yellow-600">{report.courseRequests.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accepted</span>
                      <span className="font-bold text-green-600">{report.courseRequests.accepted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-bold text-blue-600">{report.courseRequests.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled</span>
                      <span className="font-bold text-red-600">{report.courseRequests.cancelled}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Enrollments</span>
                      <span className="font-bold">{report.enrollments.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active</span>
                      <span className="font-bold text-green-600">{report.enrollments.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-bold text-blue-600">{report.enrollments.completed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 
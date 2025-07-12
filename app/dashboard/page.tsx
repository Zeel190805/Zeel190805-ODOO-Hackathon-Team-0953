"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ProfilePictureUpload } from "@/components/profile-picture-upload"

interface UserProfile {
  _id: string
  name: string
  email: string
  location?: string
  availability?: string
  skillsOffered: string[]
  skillsWanted: string[]
  isProfilePublic: boolean
  profileImage?: string
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

interface CourseEnrollment {
  _id: string
  student: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  instructor: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  courseName: string
  courseDescription: string
  skill: string
  status: "active" | "completed" | "cancelled"
  startDate: string
  endDate?: string
  progress: number
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([])
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([])
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile()
      fetchCourseRequests()
      fetchCourseEnrollments()
      fetchSwapRequests()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseRequests = async () => {
    try {
      const response = await fetch("/api/course-requests")
      if (response.ok) {
        const data = await response.json()
        setCourseRequests(data)
      } else {
        console.error("Failed to fetch course requests")
      }
    } catch (error) {
      console.error("Error fetching course requests:", error)
    }
  }

  const fetchCourseEnrollments = async () => {
    try {
      const response = await fetch("/api/course-enrollments")
      if (response.ok) {
        const data = await response.json()
        setCourseEnrollments(data)
      } else {
        console.error("Failed to fetch course enrollments")
      }
    } catch (error) {
      console.error("Error fetching course enrollments:", error)
    }
  }

  const fetchSwapRequests = async () => {
    try {
      const response = await fetch("/api/swaps")
      if (response.ok) {
        const data = await response.json()
        setSwapRequests(data)
      } else {
        console.error("Failed to fetch swap requests")
      }
    } catch (error) {
      console.error("Error fetching swap requests:", error)
    }
  }

  const handleSaveChanges = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && profile) {
      setProfile({
        ...profile,
        skillsOffered: [...profile.skillsOffered, newSkillOffered.trim()],
      })
      setNewSkillOffered("")
    }
  }

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && profile) {
      setProfile({
        ...profile,
        skillsWanted: [...profile.skillsWanted, newSkillWanted.trim()],
      })
      setNewSkillWanted("")
    }
  }

  const removeSkillOffered = (skillToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skillsOffered: profile.skillsOffered.filter((skill) => skill !== skillToRemove),
      })
    }
  }

  const removeSkillWanted = (skillToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skillsWanted: profile.skillsWanted.filter((skill) => skill !== skillToRemove),
      })
    }
  }

  const handleCourseRequestAction = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/course-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Refresh the course requests and enrollments
        fetchCourseRequests()
        fetchCourseEnrollments()
        
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

  const handleSwapRequestAction = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/swaps/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Refresh the swap requests
        fetchSwapRequests()
        
        toast({
          title: "Success",
          description: `Swap request ${status} successfully`,
        })
      } else {
        throw new Error(`Failed to ${status} swap request`)
      }
    } catch (error: any) {
      console.error(`Error updating swap request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} swap request`,
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (!profile) {
    return <div>Error loading profile</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="skills">My Skills</TabsTrigger>
          <TabsTrigger value="courses">Enrolled Courses</TabsTrigger>
          <TabsTrigger value="swaps">Swap Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your public profile and settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfilePictureUpload
                currentImage={profile.profileImage}
                onImageUpdate={(imageUrl) => setProfile({ ...profile, profileImage: imageUrl })}
                userName={profile.name}
                userEmail={profile.email}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    placeholder="e.g., Weekends, Evenings"
                    value={profile.availability || ""}
                    onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="profile-public"
                  checked={profile.isProfilePublic}
                  onCheckedChange={(checked) => setProfile({ ...profile, isProfilePublic: checked })}
                />
                <Label htmlFor="profile-public">Make Profile Public</Label>
              </div>
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="skills" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Offered</CardTitle>
                <CardDescription>Skills you can teach or provide.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skillsOffered.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-base py-1 px-3 flex items-center gap-2">
                      {skill}
                      <button
                        onClick={() => removeSkillOffered(skill)}
                        className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkillOffered()}
                  />
                  <Button onClick={addSkillOffered}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skills Wanted</CardTitle>
                <CardDescription>Skills you want to learn.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skillsWanted.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-base py-1 px-3 flex items-center gap-2">
                      {skill}
                      <button
                        onClick={() => removeSkillWanted(skill)}
                        className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkillWanted()}
                  />
                  <Button onClick={addSkillWanted}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveChanges} disabled={saving}>
              {saving ? "Saving..." : "Save Skills"}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="courses" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Requests</CardTitle>
                <CardDescription>Requests from students to learn your skills.</CardDescription>
              </CardHeader>
              <CardContent>
                {courseRequests.length === 0 ? (
                  <p className="text-muted-foreground">No course requests yet.</p>
                ) : (
                  <div className="space-y-4">
                    {courseRequests.slice(0, 5).map((request) => (
                      <div key={request._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{request.courseName}</h4>
                          <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.courseDescription}</p>
                        <div className="text-sm">Skill: <Badge variant="outline">{request.requestedSkill}</Badge></div>
                        {request.message && (
                          <p className="text-sm mt-2 italic">"{request.message}"</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          From: {request.fromUser.name}
                        </p>
                        {request.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCourseRequestAction(request._id, "rejected")}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleCourseRequestAction(request._id, "accepted")}
                            >
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Enrollments</CardTitle>
                <CardDescription>Courses you're enrolled in or teaching.</CardDescription>
              </CardHeader>
              <CardContent>
                {courseEnrollments.length === 0 ? (
                  <p className="text-muted-foreground">No course enrollments yet.</p>
                ) : (
                  <div className="space-y-4">
                    {courseEnrollments.slice(0, 5).map((enrollment) => (
                      <div key={enrollment._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{enrollment.courseName}</h4>
                          <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                            {enrollment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{enrollment.courseDescription}</p>
                        <div className="text-sm">Skill: <Badge variant="outline">{enrollment.skill}</Badge></div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {enrollment.student.email === session?.user?.email ? 
                            `Instructor: ${enrollment.instructor.name}` : 
                            `Student: ${enrollment.student.name}`
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="swaps" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Received Swap Requests</CardTitle>
                <CardDescription>Swap requests from other users.</CardDescription>
              </CardHeader>
              <CardContent>
                {swapRequests.filter(req => req.toUser.email === session?.user?.email && req.status === "pending").length === 0 ? (
                  <p className="text-muted-foreground">No pending swap requests.</p>
                ) : (
                  <div className="space-y-4">
                    {swapRequests
                      .filter(req => req.toUser.email === session?.user?.email && req.status === "pending")
                      .slice(0, 5)
                      .map((request) => (
                      <div key={request._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Swap Request</h4>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-center mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">They Offer</p>
                            <Badge variant="secondary">{request.offeredSkill}</Badge>
                          </div>
                          <div className="text-muted-foreground">→</div>
                          <div>
                            <p className="text-sm text-muted-foreground">They Want</p>
                            <Badge variant="outline">{request.requestedSkill}</Badge>
                          </div>
                        </div>
                        {request.message && (
                          <p className="text-sm mt-2 italic">"{request.message}"</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          From: {request.fromUser.name}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSwapRequestAction(request._id, "rejected")}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSwapRequestAction(request._id, "accepted")}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sent Swap Requests</CardTitle>
                <CardDescription>Swap requests you've sent to others.</CardDescription>
              </CardHeader>
              <CardContent>
                {swapRequests.filter(req => req.fromUser.email === session?.user?.email).length === 0 ? (
                  <p className="text-muted-foreground">No sent swap requests.</p>
                ) : (
                  <div className="space-y-4">
                    {swapRequests
                      .filter(req => req.fromUser.email === session?.user?.email)
                      .slice(0, 5)
                      .map((request) => (
                      <div key={request._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Swap Request</h4>
                          <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-center mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">You Offer</p>
                            <Badge variant="secondary">{request.offeredSkill}</Badge>
                          </div>
                          <div className="text-muted-foreground">→</div>
                          <div>
                            <p className="text-sm text-muted-foreground">You Want</p>
                            <Badge variant="outline">{request.requestedSkill}</Badge>
                          </div>
                        </div>
                        {request.message && (
                          <p className="text-sm mt-2 italic">"{request.message}"</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          To: {request.toUser.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

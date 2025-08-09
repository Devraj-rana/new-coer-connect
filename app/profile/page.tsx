"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserProfile, updateUserProfile, addExperience, addEducation, setAccountPrivacy, touchLastActive, scheduleAccountDeletion, cancelAccountDeletion } from "@/lib/profileActions";
import { getFollowCounts } from "@/lib/followActions";
import { getUserPosts } from "@/lib/serveractions";
import FollowButton from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleBadge from "@/components/RoleBadge";
import { toast } from "sonner";
import Image from "next/image";
import { 
  MapPin, 
  Building, 
  Globe, 
  Phone, 
  Mail, 
  Calendar,
  Edit3,
  Save,
  X,
  Plus,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Briefcase,
  GraduationCap,
  Star,
  Users,
  MessageCircle,
  Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { readFileAsDataUrl } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import StoriesBar from "@/components/StoriesBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Define a Story type for client-side use
interface StoryDoc {
  _id: string;
  userId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  textOverlay?: string;
  createdAt: string;
  viewers?: { userId: string; viewedAt: string }[];
}

interface ProfileData {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  position?: string;
  profilePhoto: string;
  coverPhoto?: string;
  role?: 'student' | 'teacher' | 'admin';
  academicYear?: '1st' | '2nd' | '3rd' | '4th';
  branch?: 'BCA' | 'B.Tech' | 'MCA' | 'M.Tech' | 'BBA' | 'MBA' | 'BSc' | 'MSc' | 'Other';
  skills?: string[];
  education?: any[];
  experience?: any[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
  isProfileComplete: boolean;
  isOnboardingComplete: boolean;
  createdAt?: string;
  isPrivate?: boolean;
  lastActiveAt?: string;
  // New deletion scheduling fields
  isDeletionScheduled?: boolean;
  deletionRequestedAt?: string;
  deleteAfterAt?: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const { user: clerkUser } = useClerkUser();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [newSkill, setNewSkill] = useState("");
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [savingExp, setSavingExp] = useState(false);
  const [savingEdu, setSavingEdu] = useState(false);
  const [newExp, setNewExp] = useState({ position: "", company: "", description: "" });
  const [newEdu, setNewEdu] = useState({ degree: "", institution: "", fieldOfStudy: "", startYear: "", endYear: "" });
  const [uploading, setUploading] = useState<{ profile: boolean; cover: boolean }>({ profile: false, cover: false });
  const [myStories, setMyStories] = useState<StoryDoc[]>([]);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryDoc | null>(null);
  const [viewers, setViewers] = useState<any[]>([]);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingEmailId, setPendingEmailId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // New: confirmation dialog for deletion
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    // mark presence
    touchLastActive();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile();
      if (profileData) {
        setProfile(profileData);
        setEditData(profileData);
        
        // Load follow counts
        const counts = await getFollowCounts(profileData.userId);
        setFollowCounts(counts);
        
        // Load user posts
        setPostsLoading(true);
        const posts = await getUserPosts();
        setUserPosts(posts || []);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
      setPostsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { lastActiveAt, isPrivate, ...rest } = editData as any; // exclude server-managed fields
      const updatedProfile = await updateUserProfile(rest);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const togglePrivacy = async (val: boolean) => {
    try {
      const p = await setAccountPrivacy(val);
      setProfile(p);
      setEditData(prev=>({ ...prev, isPrivate: p.isPrivate }));
      toast.success(val ? "Account set to Private" : "Account set to Public");
    } catch (e:any) {
      toast.error(e.message || "Failed to update privacy");
    }
  };

  // helper to compute online (active in last 2 minutes)
  const isOnline = (p?: ProfileData|null) => {
    if (!p?.lastActiveAt) return false;
    const diff = Date.now() - new Date(p.lastActiveAt).getTime();
    return diff < 2 * 60 * 1000;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialPlatform = name.split('.')[1];
      setEditData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialPlatform]: value
        }
      }));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    setEditData(prev => ({ ...prev, skills: [ ...(prev.skills || []), s ] }));
    setNewSkill("");
  };
  const removeSkill = (skill: string) => {
    setEditData(prev => ({ ...prev, skills: (prev.skills || []).filter((x) => x !== skill) }));
  };
  
  const handleAddExperience = async () => {
    if (!newExp.position || !newExp.company) {
      toast.error("Position and Company are required");
      return;
    }
    try {
      setSavingExp(true);
      const updated = await addExperience(newExp);
      setProfile(updated);
      setShowExpForm(false);
      setNewExp({ position: "", company: "", description: "" });
      toast.success("Experience added");
    } catch (e: any) {
      toast.error(e.message || "Failed to add experience");
    } finally {
      setSavingExp(false);
    }
  };

  const handleAddEducation = async () => {
    if (!newEdu.degree || !newEdu.institution) {
      toast.error("Degree and Institution are required");
      return;
    }
    try {
      setSavingEdu(true);
      const updated = await addEducation(newEdu);
      setProfile(updated);
      setShowEduForm(false);
      setNewEdu({ degree: "", institution: "", fieldOfStudy: "", startYear: "", endYear: "" });
      toast.success("Education added");
    } catch (e: any) {
      toast.error(e.message || "Failed to add education");
    } finally {
      setSavingEdu(false);
    }
  };

  // Image upload handlers
  const onProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading((u) => ({ ...u, profile: true }));
      const dataUrl = await readFileAsDataUrl(file);
      setEditData((prev) => ({ ...prev, profilePhoto: dataUrl }));
      toast.success("Profile photo ready to save");
    } catch (err: any) {
      toast.error(err.message || "Failed to read image");
    } finally {
      setUploading((u) => ({ ...u, profile: false }));
      e.target.value = ""; // reset input
    }
  };

  const onCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading((u) => ({ ...u, cover: true }));
      const dataUrl = await readFileAsDataUrl(file);
      setEditData((prev) => ({ ...prev, coverPhoto: dataUrl }));
      toast.success("Cover photo ready to save");
    } catch (err: any) {
      toast.error(err.message || "Failed to read image");
    } finally {
      setUploading((u) => ({ ...u, cover: false }));
      e.target.value = "";
    }
  };

  // Load own active stories (from feed -> filter by me)
  const loadMyStories = useCallback(async () => {
    try {
      const res = await fetch('/api/stories', { cache: 'no-store' });
      if (!res.ok) return;
      const data: StoryDoc[] = await res.json();
      if (profile?.userId) {
        setMyStories(data.filter(s => s.userId === profile.userId));
      }
    } catch {}
  }, [profile?.userId]);

  useEffect(() => {
    if (profile?.userId) {
      loadMyStories();
    }
  }, [profile?.userId, loadMyStories]);

  const openViewers = async (story: StoryDoc) => {
    setSelectedStory(story);
    setViewersOpen(true);
    setViewersLoading(true);
    try {
      const res = await fetch(`/api/stories/${story._id}/viewers`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setViewers(json.viewers || []);
      } else {
        setViewers([]);
      }
    } finally {
      setViewersLoading(false);
    }
  };

  // Trigger sending OTP for new email
  const sendEmailOtp = async () => {
    const newEmail = (editData.email || "").trim();
    if (!newEmail) return toast.error("Enter an email first");
    if (!clerkUser) return toast.error("Not authenticated");
    try {
      setOtpLoading(true);
      const email = await clerkUser.createEmailAddress({ email: newEmail });
      await email.prepareVerification({ strategy: 'email_code' });
      setPendingEmailId(email.id);
      setOtpEmail(newEmail);
      setOtpOpen(true);
      toast.success("Verification code sent");
    } catch (e:any) {
      toast.error(e?.errors?.[0]?.message || e.message || "Failed to send code");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and update primary email + profile
  const verifyEmailOtp = async () => {
    if (!clerkUser || !pendingEmailId) return;
    if (!otpCode) return toast.error("Enter the code");
    try {
      setOtpLoading(true);
      // @ts-ignore Clerk types allow
      await clerkUser.verifyEmailAddress({ code: otpCode, emailAddressId: pendingEmailId });
      await clerkUser.update({ primaryEmailAddressId: pendingEmailId });
      // persist into our profile as verified email
      const updated = await updateUserProfile({ email: otpEmail } as any);
      setProfile(updated);
      setEditData(prev=>({ ...prev, email: otpEmail }));
      setOtpOpen(false);
      setOtpCode("");
      toast.success("Email verified");
    } catch (e:any) {
      toast.error(e?.errors?.[0]?.message || e.message || "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const onScheduleDeletion = async () => {
    try {
      setDeleting(true);
      const p = await scheduleAccountDeletion();
      setProfile(p);
      toast.success("Account deletion scheduled in 7 days");
    } catch (e:any) {
      toast.error(e.message || "Failed to schedule deletion");
    } finally {
      setDeleting(false);
    }
  };

  const onCancelDeletion = async () => {
    try {
      setDeleting(true);
      const p = await cancelAccountDeletion();
      setProfile(p);
      toast.success("Deletion cancelled");
    } catch (e:any) {
      toast.error(e.message || "Failed to cancel deletion");
    } finally {
      setDeleting(false);
    }
  };

  const startMessage = async () => {
    try {
      // Guard: ensure we have a target userId to message
      const targetId = profile?.userId;
      if (!targetId) return;
      // Create or get DM thread
      const res = await fetch('/api/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: targetId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start chat');
      const threadId = json.threadId;
      router.push(`/messages?thread=${threadId}`);
    } catch (e: any) {
      toast.error(e.message || 'Could not open messages');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p className="text-gray-600">Please complete your onboarding first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Cover Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div
          className="h-64 md:h-80 relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800"
          style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Profile Info Overlay */}
        <div className="container mx-auto px-4 relative -mt-32">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                <Image
                  src={profile.profilePhoto}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${isOnline(profile) ? 'bg-green-500' : 'bg-gray-400'} border-4 border-white rounded-full`}></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-white md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {profile.role && (
                      <RoleBadge 
                        role={profile.role} 
                        academicYear={profile.academicYear}
                        branch={profile.branch}
                        size="md"
                      />
                    )}
                  </div>
                  {profile.position && (
                    <p className="text-xl text-blue-100 mt-1">{profile.position}</p>
                  )}
                  {profile.company && (
                    <p className="text-blue-200 flex items-center gap-2 mt-2">
                      <Building className="w-4 h-4" />
                      {profile.company}
                    </p>
                  )}
                  {profile.location && (
                    <p className="text-blue-200 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </p>
                  )}
                  
                  {/* Follow Counts */}
                  <div className="flex items-center gap-6 mt-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{followCounts.followers}</div>
                      <div className="text-blue-200 text-sm">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{followCounts.following}</div>
                      <div className="text-blue-200 text-sm">Following</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Follow Button */}
                  <FollowButton 
                    userId={profile.userId} 
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  />
                  <Button onClick={startMessage} className="bg-white text-blue-600 hover:bg-blue-50 inline-flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur px-3 py-2 rounded-lg">
                    <span className="text-sm">Private Account</span>
                    <Switch checked={!!profile.isPrivate} onCheckedChange={togglePrivacy} />
                  </div>
                  <Button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    {editing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                  
                  {editing && (
                    <Button
                      onClick={() => {
                        setEditing(false);
                        setEditData(profile);
                      }}
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-blue-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Uploader & Feed */}
      <StoriesBar />

      {/* My Stories (owner view) */}
      <div className="container mx-auto px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">My Stories</h3>
          <button onClick={loadMyStories} className="text-xs text-blue-600 hover:underline">Refresh</button>
        </div>
        {myStories.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto py-2">
            {myStories.map((s) => (
              <div key={s._id} className="flex-none w-28">
                <div className="w-28 h-40 rounded-lg overflow-hidden bg-muted relative">
                  {s.type === 'image' ? (
                    <img src={s.mediaUrl} alt="story" className="w-full h-full object-cover" />
                  ) : (
                    <video src={s.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                  )}
                  {s.textOverlay && (
                    <div className="absolute bottom-0 left-0 right-0 text-[10px] p-1 bg-black/40 text-white line-clamp-2">
                      {s.textOverlay}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openViewers(s)}
                  className="mt-1 w-full inline-flex items-center justify-center gap-1 text-[11px] text-gray-700 hover:text-blue-600"
                >
                  <Eye className="w-3.5 h-3.5" /> Viewers ({s.viewers?.length || 0})
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No active story. Use "Add Story" above to post one.</p>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input name="firstName" value={editData.firstName || ""} onChange={handleInputChange} placeholder="First name" />
                      <Input name="lastName" value={editData.lastName || ""} onChange={handleInputChange} placeholder="Last name" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select value={editData.role || "student"} onValueChange={(v) => setEditData(prev => ({ ...prev, role: v as any }))}>
                        <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={editData.academicYear || ""} onValueChange={(v) => setEditData(prev => ({ ...prev, academicYear: v as any }))}>
                        <SelectTrigger><SelectValue placeholder="Academic Year" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st</SelectItem>
                          <SelectItem value="2nd">2nd</SelectItem>
                          <SelectItem value="3rd">3rd</SelectItem>
                          <SelectItem value="4th">4th</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select value={editData.branch || ""} onValueChange={(v) => setEditData(prev => ({ ...prev, branch: v as any }))}>
                        <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BCA">BCA</SelectItem>
                          <SelectItem value="B.Tech">B.Tech</SelectItem>
                          <SelectItem value="MCA">MCA</SelectItem>
                          <SelectItem value="M.Tech">M.Tech</SelectItem>
                          <SelectItem value="BBA">BBA</SelectItem>
                          <SelectItem value="MBA">MBA</SelectItem>
                          <SelectItem value="BSc">BSc</SelectItem>
                          <SelectItem value="MSc">MSc</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input name="location" value={editData.location || ""} onChange={handleInputChange} placeholder="Location" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input name="company" value={editData.company || ""} onChange={handleInputChange} placeholder="Company" />
                      <Input name="position" value={editData.position || ""} onChange={handleInputChange} placeholder="Position" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" onChange={onProfileFileChange} />
                        <Input name="profilePhoto" value={editData.profilePhoto || ""} onChange={handleInputChange} placeholder="Or paste profile photo URL" />
                        {uploading.profile && <p className="text-xs text-gray-500">Processing image...</p>}
                      </div>
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" onChange={onCoverFileChange} />
                        <Input name="coverPhoto" value={editData.coverPhoto || ""} onChange={handleInputChange} placeholder="Or paste cover photo URL" />
                        {uploading.cover && <p className="text-xs text-gray-500">Processing image...</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input name="email" value={editData.email || ""} onChange={handleInputChange} placeholder="Email address" />
                      <Button type="button" variant="outline" onClick={sendEmailOtp} disabled={otpLoading}>
                        {otpLoading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {profile.firstName} {profile.lastName}</p>
                    {profile.role && <p><span className="font-medium">Role:</span> {profile.role}</p>}
                    {profile.academicYear && <p><span className="font-medium">Year:</span> {profile.academicYear}</p>}
                    {profile.branch && <p><span className="font-medium">Branch:</span> {profile.branch}</p>}
                    {profile.location && <p><span className="font-medium">Location:</span> {profile.location}</p>}
                    {(profile.company || profile.position) && <p><span className="font-medium">Work:</span> {profile.position || ""} {profile.company ? `@ ${profile.company}` : ""}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    name="bio"
                    value={editData.bio || ""}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.bio || "No bio available."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    {editing ? (
                      <Input
                        name="email"
                        value={editData.email || ""}
                        onChange={handleInputChange}
                        placeholder="Email address"
                      />
                    ) : (
                      <span className="text-gray-700">{profile.email}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    {editing ? (
                      <Input
                        name="phone"
                        value={editData.phone || ""}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                      />
                    ) : (
                      <span className="text-gray-700">{profile.phone || "Not provided"}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    {editing ? (
                      <Input
                        name="website"
                        value={editData.website || ""}
                        onChange={handleInputChange}
                        placeholder="Website URL"
                      />
                    ) : (
                      <span className="text-gray-700">{profile.website || "Not provided"}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(editData.skills || []).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="text-gray-500 hover:text-gray-700">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      />
                      <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                    {(!profile.skills || profile.skills.length === 0) && (
                      <p className="text-gray-500">No skills added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <Input
                        name="social.linkedin"
                        value={editData.socialLinks?.linkedin || ""}
                        onChange={handleInputChange}
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-gray-800" />
                      <Input
                        name="social.github"
                        value={editData.socialLinks?.github || ""}
                        onChange={handleInputChange}
                        placeholder="GitHub URL"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <Input
                        name="social.twitter"
                        value={editData.socialLinks?.twitter || ""}
                        onChange={handleInputChange}
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <Input
                        name="social.instagram"
                        value={editData.socialLinks?.instagram || ""}
                        onChange={handleInputChange}
                        placeholder="Instagram URL"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.socialLinks?.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                        <Linkedin className="w-5 h-5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profile.socialLinks?.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-3 text-gray-800 hover:text-gray-600 transition-colors">
                        <Github className="w-5 h-5" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {profile.socialLinks?.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-3 text-blue-400 hover:text-blue-600 transition-colors">
                        <Twitter className="w-5 h-5" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {profile.socialLinks?.instagram && (
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-3 text-pink-600 hover:text-pink-800 transition-colors">
                        <Instagram className="w-5 h-5" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {(!profile.socialLinks || Object.keys(profile.socialLinks).length === 0) && (
                      <p className="text-gray-500">No social links added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Posts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  My Posts ({userPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading posts...</p>
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <div key={post._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <Image
                            src={post.user.profilePhoto}
                            alt={`${post.user.firstName} ${post.user.lastName}`}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {post.user.firstName} {post.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="mb-4">
                          <p className="text-gray-800 mb-3">{post.description}</p>
                          {post.imageUrl && (
                            <div className="rounded-lg overflow-hidden">
                              <Image
                                src={post.imageUrl}
                                alt="Post image"
                                width={600}
                                height={400}
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Post Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="text-red-500">❤</span>
                            {post.likes?.length || 0} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments?.length || 0} comments
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No posts yet.</p>
                    <p className="text-sm">Share your first post to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experience
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowExpForm(v => !v)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {showExpForm ? 'Close' : 'Add Experience'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showExpForm && (
                  <div className="mb-6 p-4 border rounded-md space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input placeholder="Position" value={newExp.position} onChange={(e) => setNewExp(v => ({ ...v, position: e.target.value }))} />
                      <Input placeholder="Company" value={newExp.company} onChange={(e) => setNewExp(v => ({ ...v, company: e.target.value }))} />
                    </div>
                    <Textarea placeholder="Description" value={newExp.description} onChange={(e) => setNewExp(v => ({ ...v, description: e.target.value }))} />
                    <div className="flex gap-2">
                      <Button onClick={handleAddExperience} disabled={savingExp}>Save</Button>
                      <Button variant="ghost" onClick={() => { setShowExpForm(false); setNewExp({ position: "", company: "", description: "" }); }}>Cancel</Button>
                    </div>
                  </div>
                )}
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 pb-4">
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-blue-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No work experience added yet.</p>
                    <p className="text-sm">Add your professional experience to showcase your career journey.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowEduForm(v => !v)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {showEduForm ? 'Close' : 'Add Education'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showEduForm && (
                  <div className="mb-6 p-4 border rounded-md space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input placeholder="Degree" value={newEdu.degree} onChange={(e) => setNewEdu(v => ({ ...v, degree: e.target.value }))} />
                      <Input placeholder="Institution" value={newEdu.institution} onChange={(e) => setNewEdu(v => ({ ...v, institution: e.target.value }))} />
                    </div>
                    <Input placeholder="Field of Study" value={newEdu.fieldOfStudy} onChange={(e) => setNewEdu(v => ({ ...v, fieldOfStudy: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Start Year" value={newEdu.startYear} onChange={(e) => setNewEdu(v => ({ ...v, startYear: e.target.value }))} />
                      <Input placeholder="End Year (or Present)" value={newEdu.endYear} onChange={(e) => setNewEdu(v => ({ ...v, endYear: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddEducation} disabled={savingEdu}>Save</Button>
                      <Button variant="ghost" onClick={() => { setShowEduForm(false); setNewEdu({ degree: "", institution: "", fieldOfStudy: "", startYear: "", endYear: "" }); }}>Cancel</Button>
                    </div>
                  </div>
                )}
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-green-200 pl-4 pb-4">
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-green-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">{edu.fieldOfStudy}</p>
                        <p className="text-xs text-gray-400">
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No education information added yet.</p>
                    <p className="text-sm">Add your educational background to complete your profile.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Viewers Dialog */}
      <Dialog open={viewersOpen} onOpenChange={setViewersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Story Viewers</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto">
            {viewersLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading viewers...</div>
            ) : viewers.length > 0 ? (
              <ul className="divide-y">
                {viewers.map((v, idx) => (
                  <li key={idx} className="flex items-center gap-3 py-2">
                    <img src={v.profilePhoto || '/default-avator.png'} alt="viewer" className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{v.firstName} {v.lastName}</div>
                      <div className="text-xs text-gray-500">{new Date(v.viewedAt).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">No viewers yet.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* OTP Dialog */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">We sent a 6-digit code to {otpEmail}.</p>
            <Input value={otpCode} onChange={(e)=>setOtpCode(e.target.value)} placeholder="Enter code" maxLength={6} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={()=>setOtpOpen(false)}>Cancel</Button>
              <Button onClick={verifyEmailOtp} disabled={otpLoading}>{otpLoading ? 'Verifying...' : 'Verify'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Danger Zone: Account Deletion */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Account Deletion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Schedule your account for deletion. This action is irreversible after 7 days.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setConfirmOpen(true)}
                variant="destructive"
                disabled={deleting || !!profile.isDeletionScheduled}
                title={profile.isDeletionScheduled ? 'Already scheduled' : undefined}
              >
                {deleting ? 'Scheduling...' : 'Schedule Deletion'}
              </Button>
              <Button
                onClick={onCancelDeletion}
                variant="outline"
                disabled={deleting || !profile.isDeletionScheduled}
              >
                {deleting ? 'Cancelling...' : 'Cancel Deletion'}
              </Button>
            </div>
            {profile.isDeletionScheduled && profile.deleteAfterAt && (
              <p className="mt-4 text-sm text-red-600">
                Your account is scheduled to be permanently deleted on {new Date(profile.deleteAfterAt).toLocaleString()}.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Deletion Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm account deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-gray-700">
              Your account and all data will be permanently deleted after 7 days. You can cancel anytime before the deadline.
            </p>
            <p className="text-gray-700">Type DELETE to confirm.</p>
            <Input value={confirmText} onChange={(e)=>setConfirmText(e.target.value)} placeholder="Type DELETE" />
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={()=>{ setConfirmOpen(false); setConfirmText(""); }}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleting || confirmText !== 'DELETE'}
                onClick={async ()=>{
                  await onScheduleDeletion();
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
              >
                {deleting ? 'Scheduling...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
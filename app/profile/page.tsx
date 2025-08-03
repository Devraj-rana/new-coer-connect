"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserProfile, updateUserProfile } from "@/lib/profileActions";
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
  MessageCircle
} from "lucide-react";

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
}

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

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
      const updatedProfile = await updateUserProfile(editData);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
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
        <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
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
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
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
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
    </div>
  );
}
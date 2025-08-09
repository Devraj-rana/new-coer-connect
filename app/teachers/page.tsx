"use client";

import React, { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { getUsersByRole } from "@/lib/followActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RoleBadge from "@/components/RoleBadge";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";
import { 
  Search, 
  MapPin, 
  Building, 
  GraduationCap,
  Briefcase,
  Mail,
  Users,
  BookOpen,
  Filter,
  X,
  Grid,
  List,
  Share2,
  Bookmark,
  MessageCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  bio?: string;
  position?: string;
  company?: string;
  location?: string;
  skills?: string[];
  role: string;
  academicYear?: '1st' | '2nd' | '3rd' | '4th';
  branch?: 'BCA' | 'B.Tech' | 'MCA' | 'M.Tech' | 'BBA' | 'MBA' | 'BSc' | 'MSc' | 'Other';
  isFollowing?: boolean;
}

export default function TeachersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [allTeachers, setAllTeachers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // Immediate input value (decoupled from debounced query)
  const [searchText, setSearchText] = useState("");
  // Defer heavy updates so typing stays snappy
  const [isPending, startTransition] = useTransition();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  // New UI/UX state
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [saved, setSaved] = useState<string[]>([]);

  // Fetch teachers data
  useEffect(() => {
    const loadTeachersData = async () => {
      try {
        setLoading(true);
        const teachersData = await getUsersByRole('teacher');
        setAllTeachers(teachersData);
      } catch (error) {
        console.error("Error loading teachers:", error);
        toast.error("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };

    loadTeachersData();
  }, []);

  // Load & persist saved profiles
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('savedTeachers');
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('savedTeachers', JSON.stringify(saved));
    } catch {}
  }, [saved]);

  // Reset pagination on filter/search changes
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedDepartment, selectedExperience]);

  // Advanced filtering
  const filteredTeachers = useMemo(() => {
    return allTeachers.filter(teacher => {
      const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      // Text search
      const matchesSearch = !searchQuery || 
        fullName.includes(query) || 
        teacher.position?.toLowerCase().includes(query) ||
        teacher.company?.toLowerCase().includes(query) ||
        teacher.location?.toLowerCase().includes(query) ||
        teacher.bio?.toLowerCase().includes(query) ||
        teacher.skills?.some(skill => skill.toLowerCase().includes(query));

      // Department filter (using position/company as department proxy)
      const matchesDepartment = selectedDepartment === "all" || 
        teacher.position?.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
        teacher.company?.toLowerCase().includes(selectedDepartment.toLowerCase());
      
      // Experience filter (basic implementation)
      const matchesExperience = selectedExperience === "all" || 
        (selectedExperience === "senior" && teacher.position?.toLowerCase().includes("senior")) ||
        (selectedExperience === "professor" && teacher.position?.toLowerCase().includes("professor")) ||
        (selectedExperience === "assistant" && teacher.position?.toLowerCase().includes("assistant"));

      return matchesSearch && matchesDepartment && matchesExperience;
    });
  }, [allTeachers, searchQuery, selectedDepartment, selectedExperience]);

  // Sorting and pagination
  const sortedTeachers = useMemo(() => {
    if (sortBy === 'name') {
      return [...filteredTeachers].sort((a, b) => {
        const an = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bn = `${b.firstName} ${b.lastName}`.toLowerCase();
        return an.localeCompare(bn);
      });
    }
    // 'recent' retains backend order (createdAt desc)
    return filteredTeachers;
  }, [filteredTeachers, sortBy]);

  const visibleTeachers = useMemo(() => sortedTeachers.slice(0, visibleCount), [sortedTeachers, visibleCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    // update search query immediately as a low-priority update
    startTransition(() => setSearchQuery(value));
  };
  
  const runSearch = useCallback(() => {
    startTransition(() => setSearchQuery(searchText));
  }, [searchText, startTransition]);

  const clearFilters = () => {
    setSearchQuery("");
    setSearchText("");
    setSelectedDepartment("all");
    setSelectedExperience("all");
    setShowFilters(false);
  };

  const toggleSave = useCallback((id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleShare = useCallback(async (teacher: UserData) => {
    try {
      const url = `${window.location.origin}/profile/${teacher.userId}`;
      // @ts-ignore - navigator.share not in TS lib for all targets
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title: `${teacher.firstName} ${teacher.lastName} – COER`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied");
      }
    } catch (e) {
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${teacher.userId}`);
      toast.success("Profile link copied");
    }
  }, []);

  const startMessage = useCallback(async (targetId: string) => {
    try {
      const res = await fetch('/api/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: targetId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start chat');
      router.push(`/messages?thread=${json.threadId}`);
    } catch (e: any) {
      toast.error(e.message || 'Could not open messages');
    }
  }, [router]);

  const activeFiltersCount = (selectedDepartment !== "all" ? 1 : 0) + (selectedExperience !== "all" ? 1 : 0);

  // Quick suggested chips (static)
  const quickChips = ["Computer", "Electronics", "Mechanical", "Professor", "Assistant", "Senior"];
  // Highlights list (hook must be before any early return)
  const topHighlights = useMemo(() => allTeachers.slice(0, 12), [allTeachers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-surface rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="surface">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-2xl"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Connect with Teachers</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Discover and connect with experienced educators and mentors in the COER community
          </p>

          {/* Highlights (story-style) */}
          {topHighlights.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <div className="flex gap-5 min-w-max pr-2">
                {topHighlights.map(t => (
                  <Link key={t.userId} href={`/profile/${t.userId}?from=teachers`} className="group flex flex-col items-center gap-2">
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-500">
                      <div className="p-0.5 bg-background rounded-full">
                        <Image src={t.profilePhoto} alt={`${t.firstName} ${t.lastName}`} width={64} height={64} className="w-16 h-16 rounded-full object-cover group-hover:scale-[1.03] transition-transform" />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground max-w-20 truncate">{t.firstName}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name, skills, company, location, or bio..."
                  value={searchText}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } }}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
              <Button onClick={runSearch} className="min-w-[100px]" disabled={isPending}>Search</Button>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 min-w-fit"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              {quickChips.map(chip => (
                <Button key={chip} size="sm" variant="secondary" className="h-8 rounded-full" onClick={() => {
                  const c = chip.toLowerCase();
                  if (["computer","electronics","mechanical"].includes(c)) setSelectedDepartment(c);
                  if (["professor","assistant","senior"].includes(c)) setSelectedExperience(c);
                }}>
                  {chip}
                </Button>
              ))}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="surface p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">Department</label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="computer">Computer Science</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="civil">Civil</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
                    <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="assistant">Assistant Professor</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="senior">Senior Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Results Summary */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {visibleTeachers.length} of {filteredTeachers.length} teachers {isPending && <span className="ml-2 opacity-70">(updating...)</span>}
              </p>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name A–Z</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex rounded-md border border-border overflow-hidden">
                  <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setView('grid')}>
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setView('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Grid/List */}
        {visibleTeachers.length > 0 ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTeachers.map((teacher) => (
                <Card key={teacher.userId} className="group relative overflow-hidden surface hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 rounded-2xl">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Header with Enhanced Profile */}
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="relative overflow-hidden rounded-2xl">
                          <Image
                            src={teacher.profilePhoto}
                            alt={`${teacher.firstName} ${teacher.lastName}`}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        
                        {/* Role Badge */}
                        <div className="absolute -top-2 -left-2">
                          <RoleBadge role="teacher" size="sm" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/profile/${teacher.userId}?from=teachers`}
                          className="group/link block"
                        >
                          <h3 className="font-bold text-xl text-foreground group-hover/link:text-primary transition-colors duration-200 truncate">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                        </Link>
                        
                        {teacher.position && (
                          <div className="flex items-center gap-2 mt-1">
                            <GraduationCap className="w-4 h-4 text-emerald-600" />
                            <p className="text-emerald-600 text-sm font-semibold truncate">
                              {teacher.position}
                            </p>
                          </div>
                        )}
                        
                        {teacher.company && (
                          <div className="flex items-center gap-2 mt-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm truncate">
                              {teacher.company}
                            </p>
                          </div>
                        )}
                        
                        {teacher.location && (
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm truncate">
                              {teacher.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10">
                    {/* Bio Section */}
                    {teacher.bio && (
                      <div className="mb-6">
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {teacher.bio}
                        </p>
                      </div>
                    )}

                    {/* Skills Section */}
                    {teacher.skills && teacher.skills.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-foreground">Expertise</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacher.skills.slice(0, 4).map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-0 rounded-full hover:shadow-md transition-shadow duration-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {teacher.skills.length > 4 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs px-3 py-1.5 border-dashed border-emerald-500/30 text-emerald-600 rounded-full"
                            >
                              +{teacher.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border/50">
                      {user && user.id !== teacher.userId && (
                        <>
                          <FollowButton
                            userId={teacher.userId}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          />
                          <Button
                            size="sm"
                            className="flex-1 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-500/30"
                            onClick={() => startMessage(teacher.userId)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 border-emerald-500/20 hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all duration-200"
                      >
                        <Link href={`/profile/${teacher.userId}?from=teachers`}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(teacher)}
                        className="px-3 hover:bg-emerald-500/10 transition-colors duration-200"
                        title="Share profile"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant={saved.includes(teacher.userId) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => toggleSave(teacher.userId)}
                        className="px-3"
                        title={saved.includes(teacher.userId) ? "Saved" : "Save"}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // List view
            <div className="space-y-4">
              {visibleTeachers.map(teacher => (
                <Card key={teacher.userId} className="surface hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/${teacher.userId}?from=teachers`} className="relative">
                        <Image src={teacher.profilePhoto} alt={`${teacher.firstName} ${teacher.lastName}`} width={56} height={56} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="absolute -top-1 -left-1"><RoleBadge role="teacher" size="sm" /></div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/profile/${teacher.userId}?from=teachers`} className="font-semibold text-foreground hover:text-primary truncate">
                            {teacher.firstName} {teacher.lastName}
                          </Link>
                          {teacher.position && (
                            <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">{teacher.position}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                          {teacher.company && (<span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {teacher.company}</span>)}
                          {teacher.location && (<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {teacher.location}</span>)}
                          {teacher.skills && teacher.skills.length > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" /> {teacher.skills.slice(0,3).join(', ')}{teacher.skills.length>3?'…':''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {user && user.id !== teacher.userId && (
                          <>
                            <FollowButton userId={teacher.userId} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white" />
                            <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-500/30" onClick={() => startMessage(teacher.userId)}>
                              <MessageCircle className="w-4 h-4 mr-1" /> Message
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/profile/${teacher.userId}?from=teachers`}>View</Link>
                        </Button>
                        <Button variant={saved.includes(teacher.userId) ? "default" : "ghost"} size="icon" onClick={() => toggleSave(teacher.userId)}>
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleShare(teacher)}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-16 h-16 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No teachers found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms to find teachers" 
                : "Teachers will appear here once they complete their profiles!"
              }
            </p>
          </div>
        )}

        {/* Load more */}
        {visibleTeachers.length < sortedTeachers.length && (
          <div className="flex justify-center mt-8">
            <Button onClick={() => setVisibleCount(c => c + 12)} variant="secondary" className="rounded-full">
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

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
  Bookmark
} from "lucide-react";

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

// Removed debounce; we will perform live search with low-priority transitions
export default function StudentsPage() {
  const { user } = useUser();
  const [allStudents, setAllStudents] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [saved, setSaved] = useState<string[]>([]);

  // Load & persist saved profiles
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('savedStudents');
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('savedStudents', JSON.stringify(saved));
    } catch {}
  }, [saved]);

  useEffect(() => {
    const loadStudentsData = async () => {
      try {
        setLoading(true);
        const studentsData = await getUsersByRole('student');
        setAllStudents(studentsData);
      } catch (error) {
        console.error("Error loading students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudentsData();
  }, []);

  // Reset pagination on filter/search changes
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedBranch, selectedYear]);

  // Advanced filtering
  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      // Text search
      const matchesSearch = !searchQuery || 
        fullName.includes(query) || 
        student.position?.toLowerCase().includes(query) ||
        student.company?.toLowerCase().includes(query) ||
        student.location?.toLowerCase().includes(query) ||
        student.bio?.toLowerCase().includes(query) ||
        student.skills?.some(skill => skill.toLowerCase().includes(query));

      // Branch filter
      const matchesBranch = selectedBranch === "all" || student.branch === selectedBranch;
      
      // Year filter
      const matchesYear = selectedYear === "all" || student.academicYear === selectedYear;

      return matchesSearch && matchesBranch && matchesYear;
    });
  }, [allStudents, searchQuery, selectedBranch, selectedYear]);
  
  // Sorting and pagination
  const sortedStudents = useMemo(() => {
    if (sortBy === 'name') {
      return [...filteredStudents].sort((a, b) => {
        const an = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bn = `${b.firstName} ${b.lastName}`.toLowerCase();
        return an.localeCompare(bn);
      });
    }
    return filteredStudents;
  }, [filteredStudents, sortBy]);
  
  const visibleStudents = useMemo(() => sortedStudents.slice(0, visibleCount), [sortedStudents, visibleCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    startTransition(() => setSearchQuery(value));
  };

  const runSearch = useCallback(() => {
    startTransition(() => setSearchQuery(searchText));
  }, [searchText, startTransition]);

  const clearFilters = () => {
    setSearchQuery("");
    setSearchText("");
    setSelectedBranch("all");
    setSelectedYear("all");
    setShowFilters(false);
  };

  const toggleSave = useCallback((id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleShare = useCallback(async (student: UserData) => {
    try {
      const url = `${window.location.origin}/profile/${student.userId}`;
      // @ts-ignore
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title: `${student.firstName} ${student.lastName} – COER`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied");
      }
    } catch (e) {
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${student.userId}`);
      toast.success("Profile link copied");
    }
  }, []);

  const activeFiltersCount = (selectedBranch !== "all" ? 1 : 0) + (selectedYear !== "all" ? 1 : 0);

  // Quick chips and highlights
  const quickChips = ["B.Tech", "BCA", "MCA", "1st", "2nd", "3rd", "4th"];
  const topHighlights = useMemo(() => allStudents.slice(0, 12), [allStudents]);

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
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Connect with Students</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Discover and connect with fellow students in the COER community
          </p>

          {/* Highlights (story-style) */}
          {topHighlights.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <div className="flex gap-5 min-w-max pr-2">
                {topHighlights.map(s => (
                  <Link key={s.userId} href={`/profile/${s.userId}?from=students`} className="group flex flex-col items-center gap-2">
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-indigo-500">
                      <div className="p-0.5 bg-background rounded-full">
                        <Image src={s.profilePhoto} alt={`${s.firstName} ${s.lastName}`} width={64} height={64} className="w-16 h-16 rounded-full object-cover group-hover:scale-[1.03] transition-transform" />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground max-w-20 truncate">{s.firstName}</span>
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
              
              {/* Quick chips */}
              <div className="flex flex-wrap gap-2 sm:ml-2">
                {quickChips.map(chip => (
                  <Button key={chip} size="sm" variant="secondary" className="h-8 rounded-full" onClick={() => {
                    if (["B.Tech","BCA","MCA"].includes(chip)) setSelectedBranch(chip as any);
                    if (["1st","2nd","3rd","4th"].includes(chip)) setSelectedYear(chip as any);
                  }}>
                    {chip}
                  </Button>
                ))}
              </div>
               
              
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

            {/* Filter Panel */}
            {showFilters && (
              <Card className="surface p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">Branch</label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
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
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">Academic Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="1st">1st Year</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
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
                Showing {visibleStudents.length} of {filteredStudents.length} students {isPending && <span className="ml-2 opacity-70">(updating...)</span>}
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

        {/* Students Grid/List */}
        {visibleStudents.length > 0 ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleStudents.map((student) => (
                <Card key={student.userId} className="group relative overflow-hidden surface hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 rounded-2xl">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Header with Enhanced Profile */}
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="relative overflow-hidden rounded-2xl">
                          <Image
                            src={student.profilePhoto}
                            alt={`${student.firstName} ${student.lastName}`}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        
                        {/* Role Badge */}
                        <div className="absolute -top-2 -left-2">
                          <RoleBadge 
                            role="student" 
                            academicYear={student.academicYear} 
                            branch={student.branch}
                            size="sm" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/profile/${student.userId}?from=students`}
                          className="group/link block"
                        >
                          <h3 className="font-bold text-xl text-foreground group-hover/link:text-primary transition-colors duration-200 truncate">
                            {student.firstName} {student.lastName}
                          </h3>
                        </Link>
                        
                        {student.position && (
                          <div className="flex items-center gap-2 mt-1">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            <p className="text-primary text-sm font-semibold truncate">
                              {student.position}
                            </p>
                          </div>
                        )}
                        
                        {student.company && (
                          <div className="flex items-center gap-2 mt-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm truncate">
                              {student.company}
                            </p>
                          </div>
                        )}
                        
                        {student.location && (
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm truncate">
                              {student.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10">
                    {/* Bio Section */}
                    {student.bio && (
                      <div className="mb-6">
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {student.bio}
                        </p>
                      </div>
                    )}

                    {/* Skills Section */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.slice(0, 4).map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full hover:shadow-md transition-shadow duration-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {student.skills.length > 4 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs px-3 py-1.5 border-dashed border-primary/30 text-primary rounded-full"
                            >
                              +{student.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border/50">
                      {user && user.id !== student.userId && (
                        <FollowButton
                          userId={student.userId}
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        />
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200"
                      >
                        <Link href={`/profile/${student.userId}?from=students`}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      
                      <Button variant={saved.includes(student.userId) ? "default" : "ghost"} size="sm" onClick={() => toggleSave(student.userId)} title={saved.includes(student.userId) ? "Saved" : "Save"}>
                        <Bookmark className="w-4 h-4" />
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => handleShare(student)} title="Share profile" className="px-3 hover:bg-primary/10">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // List view
            <div className="space-y-4">
              {visibleStudents.map(student => (
                <Card key={student.userId} className="surface hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/${student.userId}?from=students`} className="relative">
                        <Image src={student.profilePhoto} alt={`${student.firstName} ${student.lastName}`} width={56} height={56} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="absolute -top-1 -left-1">
                          <RoleBadge role="student" academicYear={student.academicYear} branch={student.branch} size="sm" />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/profile/${student.userId}?from=students`} className="font-semibold text-foreground hover:text-primary truncate">
                            {student.firstName} {student.lastName}
                          </Link>
                          {student.position && (<span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{student.position}</span>)}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                          {student.company && (<span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {student.company}</span>)}
                          {student.location && (<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {student.location}</span>)}
                          {student.skills && student.skills.length > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" /> {student.skills.slice(0,3).join(', ')}{student.skills.length>3?'…':''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {user && user.id !== student.userId && (
                          <FollowButton userId={student.userId} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" />
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/profile/${student.userId}?from=students`}>View</Link>
                        </Button>
                        <Button variant={saved.includes(student.userId) ? "default" : "ghost"} size="icon" onClick={() => toggleSave(student.userId)}>
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleShare(student)}>
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
             <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
               <Users className="w-16 h-16 text-primary" />
             </div>
             <h3 className="text-xl font-semibold text-foreground mb-2">No students found</h3>
             <p className="text-muted-foreground">
               {searchQuery 
                 ? "Try adjusting your search terms to find students" 
                 : "Students will appear here once they complete their profiles!"
               }
             </p>
           </div>
         )}

        {/* Load more */}
        {visibleStudents.length < sortedStudents.length && (
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

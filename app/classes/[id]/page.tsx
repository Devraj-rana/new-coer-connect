"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen,
  Plus,
  FileText,
  Megaphone,
  Settings,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Send,
  AlertCircle
} from 'lucide-react';
import { getClassById, addMaterial, addAssignment, addAnnouncement } from '@/lib/classActions';
import { IClass } from '@/models/class.model';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function ClassDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<IClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'PDF' as 'PDF' | 'Video' | 'Article' | 'Code' | 'Link',
    url: '',
    description: ''
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100
  });
  
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    isImportant: false
  });

  const loadClassData = async () => {
    try {
      const data = await getClassById(classId);
      setClassData(data);
    } catch (error) {
      console.error('Error loading class:', error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && classId) {
      loadClassData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, classId]);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMaterial(classId, materialForm);
      setMaterialForm({ title: '', type: 'PDF', url: '', description: '' });
      await loadClassData();
      toast({
        title: "Success",
        description: "Material added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAssignment(classId, {
        ...assignmentForm,
        dueDate: new Date(assignmentForm.dueDate)
      });
      setAssignmentForm({ title: '', description: '', dueDate: '', maxMarks: 100 });
      await loadClassData();
      toast({
        title: "Success",
        description: "Assignment added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAnnouncement(classId, announcementForm);
      setAnnouncementForm({ title: '', message: '', isImportant: false });
      await loadClassData();
      toast({
        title: "Success",
        description: "Announcement added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getScheduleDisplay = (schedule: IClass['schedule']) => {
    if (!schedule || schedule.length === 0) return 'No schedule set';
    
    return schedule.map(s => 
      `${s.dayOfWeek} ${s.startTime}-${s.endTime}${s.room ? ` (${s.room})` : ''}`
    ).join(', ');
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-4 w-4" />;
      case 'Video': return <Eye className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getMaterialColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'bg-red-100 text-red-800';
      case 'Video': return 'bg-purple-100 text-purple-800';
      case 'Article': return 'bg-blue-100 text-blue-800';
      case 'Code': return 'bg-green-100 text-green-800';
      case 'Link': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading class data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Class not found</h2>
            <p className="text-gray-600 mb-6">The class you're looking for doesn't exist or you don't have access to it.</p>
            <Button asChild>
              <Link href="/classes">Back to Classes</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/classes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Classes
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {classData.title}
                </h1>
                <p className="text-gray-600 text-sm">{classData.courseCode} • {classData.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{classData.semester} Semester</Badge>
              <Button asChild variant="outline" size="sm">
                <Link href={`/classes/${classId}/edit`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Class Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Class Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-600">{classData.description || 'No description available'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Academic Year</h4>
                      <p className="text-gray-600">{classData.academicYear}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Capacity</h4>
                      <p className="text-gray-600">{classData.enrolledStudents?.length || 0}/{classData.maxStudents} students</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Schedule</h4>
                    <p className="text-gray-600">{getScheduleDisplay(classData.schedule)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Enrolled Students</p>
                        <p className="text-2xl font-bold">{classData.enrolledStudents?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Materials</p>
                        <p className="text-2xl font-bold">{classData.materials?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Assignments</p>
                        <p className="text-2xl font-bold">{classData.assignments?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>
                      {classData.enrolledStudents?.length || 0} of {classData.maxStudents} students enrolled
                    </CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {classData.enrolledStudents && classData.enrolledStudents.length > 0 ? (
                  <div className="space-y-3">
                    {classData.enrolledStudents.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.profilePhoto}
                            alt={student.firstName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h4 className="font-medium">{student.firstName} {student.lastName}</h4>
                            <p className="text-sm text-gray-500">Student ID: {student.userId}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No students enrolled yet</h3>
                    <p className="text-gray-600 mb-4">Students will appear here once they enroll in your class.</p>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Students
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Material Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Material</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMaterial} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="materialTitle">Title</Label>
                      <Input
                        id="materialTitle"
                        value={materialForm.title}
                        onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materialType">Type</Label>
                      <select
                        id="materialType"
                        value={materialForm.type}
                        onChange={(e) => setMaterialForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Video">Video</option>
                        <option value="Article">Article</option>
                        <option value="Code">Code</option>
                        <option value="Link">Link</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materialUrl">URL</Label>
                      <Input
                        id="materialUrl"
                        type="url"
                        value={materialForm.url}
                        onChange={(e) => setMaterialForm(prev => ({ ...prev, url: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materialDesc">Description</Label>
                      <Textarea
                        id="materialDesc"
                        value={materialForm.description}
                        onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Materials List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Study Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {classData.materials && classData.materials.length > 0 ? (
                      <div className="space-y-3">
                        {classData.materials.map((material, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getMaterialIcon(material.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{material.title}</h4>
                                  <Badge variant="secondary" className={`text-xs ${getMaterialColor(material.type)}`}>
                                    {material.type}
                                  </Badge>
                                </div>
                                {material.description && (
                                  <p className="text-sm text-gray-600">{material.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Added {new Date(material.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="ghost" size="sm">
                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No materials yet</h3>
                        <p className="text-gray-600">Add study materials for your students.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs would continue similarly... */}
        </Tabs>
      </div>
    </div>
  );
}

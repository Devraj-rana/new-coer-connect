"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  VideoIcon, 
  MicIcon, 
  PhoneIcon, 
  SendIcon, 
  SearchIcon,
  BookOpenIcon,
  PlayIcon,
  FileTextIcon,
  CodeIcon,
  ClockIcon,
  UsersIcon,
  MessageCircleIcon,
  CameraIcon,
  MicOffIcon,
  VideoOffIcon,
  SettingsIcon,
  ScreenShareIcon
} from 'lucide-react';

const LiveStudyPage: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Johnson', text: 'Welcome everyone! Today we\'ll cover React Hooks in detail.', timestamp: '2:00 PM', isOwn: false },
    { id: 2, sender: 'Alex Chen', text: 'Thank you professor! Looking forward to this session.', timestamp: '2:01 PM', isOwn: false },
    { id: 3, sender: 'You', text: 'Excited to learn about useEffect and useState!', timestamp: '2:02 PM', isOwn: true },
  ]);
  const [message, setMessage] = useState('');
  const [reminderSet, setReminderSet] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Sample data
  const upcomingClasses = [
    { title: 'React Hooks Deep Dive', schedule: 'Today 3:00 PM', participants: 24, instructor: 'Dr. Sarah Johnson' },
    { title: 'Database Design Patterns', schedule: 'Tomorrow 10:00 AM', participants: 18, instructor: 'Prof. Mike Wilson' },
    { title: 'API Development Workshop', schedule: 'Friday 2:00 PM', participants: 32, instructor: 'Dr. Emily Davis' }
  ];

  const studyMaterials = [
    { title: 'React Hooks Documentation', type: 'PDF', description: 'Official React documentation with examples', icon: FileTextIcon },
    { title: 'JavaScript ES6+ Features', type: 'Video', description: '45-minute comprehensive tutorial', icon: PlayIcon },
    { title: 'Modern CSS Techniques', type: 'Article', description: 'Grid, Flexbox, and CSS Variables', icon: BookOpenIcon },
    { title: 'Node.js Best Practices', type: 'PDF', description: 'Production-ready backend development', icon: FileTextIcon },
    { title: 'React Code Examples', type: 'Code', description: 'Practical hooks implementation', icon: CodeIcon },
    { title: 'Testing React Apps', type: 'Video', description: 'Jest and React Testing Library', icon: PlayIcon }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Video': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Article': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Code': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Send message to chat
  const sendMessage = () => {
    if (message.trim() === '') return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  // Clear all chat messages
  const clearChat = () => {
    setMessages([]);
  };

  // Handle end call
  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsJoined(false);
  };

  // Handle Enter key press for sending messages
  const handleSendMessage = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  // Handle starting video stream
  const handleJoinClass = async () => {
    setReminderSet(true);
    setIsJoined(true);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera/mic:', error);
      alert('Camera & microphone access is required to join the class.');
    }
  };
  
  // Filter materials based on search term
  const filteredMaterials = studyMaterials.filter(material => 
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Set video stream to video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Live Study
              </h1>
              <p className="text-gray-600 text-sm">Interactive learning sessions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  className="pl-10 w-64"
                  placeholder="Search materials, classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Section - Takes 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-6">
          {/* Live Class Video */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    React Hooks Deep Dive
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span>Dr. Sarah Johnson</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      45 mins remaining
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      24 participants
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                {stream && isJoined ? (
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <VideoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-medium mb-2">Ready to Join?</h3>
                      <p className="text-gray-300 mb-6">Click below to start your video and join the class</p>
                      <Button 
                        onClick={handleJoinClass}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <VideoIcon className="h-5 w-5 mr-2" />
                        Join Class
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Video Controls */}
                {isJoined && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                    <Button
                      size="sm"
                      variant={isMicOn ? "default" : "destructive"}
                      className="rounded-full w-10 h-10 p-0"
                      onClick={() => setIsMicOn(!isMicOn)}
                    >
                      {isMicOn ? <MicIcon className="h-4 w-4" /> : <MicOffIcon className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isCameraOn ? "default" : "destructive"}
                      className="rounded-full w-10 h-10 p-0"
                      onClick={() => setIsCameraOn(!isCameraOn)}
                    >
                      {isCameraOn ? <CameraIcon className="h-4 w-4" /> : <VideoOffIcon className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full w-10 h-10 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <ScreenShareIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full w-10 h-10 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full w-10 h-10 p-0"
                      onClick={handleEndCall}
                    >
                      <PhoneIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Study Materials</CardTitle>
              <CardDescription>Resources for this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMaterials.map((material, index) => {
                  const IconComponent = material.icon;
                  return (
                    <Card key={index} className="transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-tight">{material.title}</h4>
                              <Badge variant="secondary" className={`text-xs ${getTypeColor(material.type)}`}>
                                {material.type}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-xs mt-1 line-clamp-2">{material.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingClasses.map((cls, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-sm">{cls.title}</h4>
                  <p className="text-gray-600 text-xs mt-1">{cls.instructor}</p>
                  <p className="text-gray-500 text-xs">{cls.schedule}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <UsersIcon className="h-3 w-3" />
                      {cls.participants} joined
                    </span>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setReminderSet(true)}
                    >
                      {reminderSet ? '✓ Reminded' : 'Set Reminder'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="flex flex-col h-96">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircleIcon className="h-5 w-5" />
                  Class Chat
                </CardTitle>
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <div 
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto px-4 space-y-3"
              >
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.isOwn 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {!msg.isOwn && (
                        <div className="font-medium text-xs mb-1 opacity-80">{msg.sender}</div>
                      )}
                      <div className="text-sm">{msg.text}</div>
                      <div className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    className="flex-1"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleSendMessage}
                  />
                  <Button
                    onClick={sendMessage}
                    size="sm"
                    disabled={!message.trim()}
                    className="px-3"
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveStudyPage;

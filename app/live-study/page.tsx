'use client'
import React, { useState, useEffect, useRef } from 'react';

const LiveStudyPage: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<{text: string, sender: string, isOwn: boolean, timestamp: string}>>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reminderSet, setReminderSet] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('liveStudyMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Default messages if no saved messages
      const defaultMessages = [
        { text: 'Great session today!', sender: 'John', isOwn: false, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        { text: 'Thanks for the explanation!', sender: 'Sarah', isOwn: false, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
      ];
      setMessages(defaultMessages);
      localStorage.setItem('liveStudyMessages', JSON.stringify(defaultMessages));
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('liveStudyMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Materials data
  const studyMaterials = [
    {
      type: 'PDF',
      title: 'Introduction to HTML',
      description: '15 pages · Updated 2 days ago'
    }
  ];
  
  // Upcoming classes data
  const upcomingClasses = [
    {
      title: 'Advanced JavaScript',
      schedule: 'Tomorrow · 10:00 AM'
    }
  ];
  
  // Handle end call confirmation
  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to leave the class?')) {
      // In a real app, this would navigate to another page
      console.log('Ending call');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };
  
  // Handle sending a chat message
  const sendMessage = () => {
    console.log('Send button clicked!', message); // Debug log
    if (message.trim()) {
      const messageData = {
        text: message,
        sender: 'You',
        isOwn: true,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, messageData]);
      setMessage('');
    }
  };

  // Clear chat history
  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      localStorage.removeItem('liveStudyMessages');
    }
  };

  const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  // Handle starting video stream
  const handleJoinClass = async () => {
    setReminderSet(true);
    
    try {
      // Request camera & microphone access
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
    <div className="min-h-screen bg-cover bg-center pt-16" style={{ backgroundImage: "url('/images/bmhome.jpg')" }}>
      {/* Header */}
      <header className="bg-white flex items-center p-2 shadow-md">
        <div className="text-blue-600 text-2xl font-bold mr-8">Live Connect</div>
        <nav className="hidden md:flex gap-8">
          <a href="#index.html" className="text-gray-800 font-medium">Home</a>
          <a href="#live-classes" className="text-gray-800 font-medium">Live Classes</a>
          <a href="#materials" className="text-gray-800 font-medium">Study Materials</a>
          <a href="#community" className="text-gray-800 font-medium">Community</a>
        </nav>
        <input 
          type="text" 
          className="ml-auto p-2 border border-gray-300 rounded-md w-64"
          placeholder="Search courses, materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="ml-4">👤</div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Left Column (2/3 width on md screens) */}
        <div className="md:col-span-2 space-y-8">
          {/* Live Class Section */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Live Class: Web Development 101</h2>
            <div className="relative bg-black rounded-lg h-96 mb-4">
              {stream && (
                <video 
                  ref={videoRef}
                  autoPlay 
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button className="bg-white bg-opacity-80 p-3 rounded-full">🎤</button>
                <button className="bg-white bg-opacity-80 p-3 rounded-full">📹</button>
                <button 
                  className="bg-white bg-opacity-80 p-3 rounded-full"
                  onClick={handleEndCall}
                >
                  📞
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-700">Instructor: Dr. Sarah Johnson</p>
              <p className="text-gray-700">Duration: 45 mins remaining</p>
            </div>
          </section>

          {/* Study Materials */}
          <section>
            <h2 className="text-xl font-bold mb-4">Study Materials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <span className="text-blue-600 text-sm">{material.type}</span>
                  <h3 className="font-medium">{material.title}</h3>
                  <p className="text-gray-700 text-sm">{material.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          <section className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-3">Upcoming Classes</h3>
            {upcomingClasses.map((cls, index) => (
              <div key={index} className="py-4 border-b border-gray-100">
                <h4 className="font-medium">{cls.title}</h4>
                <p className="text-gray-700">{cls.schedule}</p>
                <button 
                  className={`mt-2 px-4 py-2 rounded-md ${
                    reminderSet ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                  }`}
                  onClick={handleJoinClass}
                  disabled={reminderSet}
                >
                  {reminderSet ? 'Joined ✓' : 'Set Reminder'}
                </button>
              </div>
            ))}
          </section>

          {/* Live Chat */}
          <section className="bg-white p-6 rounded-lg h-96 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Class Chat</h3>
              <button
                onClick={clearChat}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-300 rounded hover:bg-red-50"
              >
                Clear Chat
              </button>
            </div>
            <div 
              ref={chatMessagesRef}
              className="flex-grow overflow-y-auto mb-4"
            >
              {messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg max-w-xs ${
                    msg.isOwn 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <div className="font-medium text-sm">{msg.sender}</div>
                    <div>{msg.text}</div>
                    <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 p-3 border border-gray-300 rounded-full"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleSendMessage}
              />
              <button
                type="button"
                onClick={() => {
                  console.log('Button clicked, message:', message);
                  sendMessage();
                }}
                className="px-4 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                disabled={!message.trim()}
              >
                Send
              </button>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default LiveStudyPage;
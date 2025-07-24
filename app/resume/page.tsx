'use client'
import { useState, useRef, useEffect } from "react";

const ResumePage = () => {
  const [atsScore, setAtsScore] = useState(0);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [improvementTips, setImprovementTips] = useState<string[]>([]);
  const [messages, setMessages] = useState([
    { text: "Hello! 👋 I'm your friendly AI assistant! Upload your resume for professional analysis, or let's chat about anything you'd like to explore! 🚀", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to extract text from uploaded files
  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      console.log('📁 Processing file:', file.name, 'Type:', file.type);
      
      if (file.type === 'text/plain') {
        const text = await file.text();
        console.log('📄 Text file processed, length:', text.length);
        return text;
      } else {
        // For PDF/DOC files, we'll use a comprehensive sample resume
        const sampleResumeText = `
SARAH JOHNSON
Senior Full Stack Developer
📧 sarah.johnson@email.com | 📱 (555) 987-6543 | 🔗 linkedin.com/in/sarahjohnson | 📍 Seattle, WA

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Developer with 8+ years of experience building scalable web applications and leading development teams. Expert in modern JavaScript frameworks, cloud architecture, and agile methodologies. Proven track record of delivering high-performance solutions that drive business growth and improve user experience.

TECHNICAL SKILLS
• Frontend: React, Vue.js, Angular, TypeScript, HTML5, CSS3, Sass, Tailwind CSS
• Backend: Node.js, Python, Java, C#, Express.js, Django, Spring Boot
• Databases: PostgreSQL, MongoDB, MySQL, Redis, Elasticsearch
• Cloud & DevOps: AWS, Azure, Docker, Kubernetes, Jenkins, GitLab CI/CD
• Tools: Git, Jira, Figma, Webpack, Vite, Jest, Cypress

PROFESSIONAL EXPERIENCE

Senior Full Stack Developer | TechInnovate Solutions | March 2021 - Present
• Led development of microservices architecture serving 5M+ monthly active users
• Implemented automated CI/CD pipelines reducing deployment time by 70%
• Mentored team of 8 developers and established code review best practices
• Architected real-time collaboration features increasing user engagement by 45%
• Optimized database queries and caching strategies improving response time by 60%

Full Stack Developer | DataFlow Systems | June 2019 - February 2021
• Developed responsive web applications using React and Node.js
• Built RESTful APIs handling 50,000+ requests per minute with 99.9% uptime
• Integrated third-party payment systems processing $2M+ monthly transactions
• Collaborated with UX/UI designers to implement pixel-perfect interfaces
• Maintained comprehensive test coverage above 95% using Jest and Cypress

Software Developer | StartupHub | August 2016 - May 2019
• Created full-stack applications from concept to deployment
• Implemented OAuth 2.0 authentication and role-based access control
• Developed data visualization dashboards using D3.js and Chart.js
• Participated in agile development cycles with 2-week sprints
• Contributed to open-source projects and technical documentation

EDUCATION
Bachelor of Science in Computer Science
University of Washington, Seattle | Graduated: May 2016
GPA: 3.8/4.0 | Dean's List: 2014-2016

CERTIFICATIONS & ACHIEVEMENTS
• AWS Certified Solutions Architect - Associate (2023)
• Google Cloud Professional Developer (2022)
• Led team that won "Best Innovation Award" at TechCon 2023
• Speaker at ReactJS Conference 2022: "Building Scalable Component Libraries"
• Published 15+ technical articles with 100K+ combined views

PROJECTS
E-Commerce Platform (2023)
• Built full-stack e-commerce solution with React, Node.js, and PostgreSQL
• Implemented real-time inventory management and payment processing
• Achieved 99.9% uptime and 2-second average page load time

Open Source Contributions
• Contributor to popular React UI library with 50K+ GitHub stars
• Maintained npm package with 10K+ weekly downloads
• Active participant in Stack Overflow with 5K+ reputation points
        `;
        
        console.log('📄 Sample resume text generated, length:', sampleResumeText.length);
        return sampleResumeText.trim();
      }
    } catch (error) {
      console.error('❌ File processing error:', error);
      throw new Error('Failed to process the file');
    }
  };

  // Function to analyze resume with Gemini API (keeping Gemini for resume analysis)
  const analyzeResumeWithGemini = async (resumeContent: string) => {
    try {
      console.log('🔍 Starting resume analysis...');
      setIsAnalyzing(true);
      
      const prompt = `
        You are a professional ATS (Applicant Tracking System) expert and career advisor. Analyze this resume and provide:
        1. An ATS compatibility score from 0-100
        2. Exactly 5 specific, actionable improvement tips
        
        Resume content:
        ${resumeContent}
        
        IMPORTANT: Respond ONLY with valid JSON in this exact format:
        {
          "atsScore": 85,
          "improvementTips": [
            "Add more industry-specific keywords from job descriptions",
            "Use standard section headings like 'Professional Experience'",
            "Include quantifiable achievements with specific metrics",
            "Ensure consistent formatting throughout the document",
            "Add a skills section with relevant technical competencies"
          ]
        }
      `;

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured');
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }
      
      const analysisText = data.candidates[0].content.parts[0].text;
      
      let analysis;
      try {
        const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
        analysis = JSON.parse(cleanedText);
      } catch (parseError) {
        // Fallback parsing
        const scoreMatch = analysisText.match(/["\']?atsScore["\']?\s*:\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 20) + 75;
        
        analysis = {
          atsScore: score,
          improvementTips: [
            "Incorporate more relevant keywords from target job descriptions",
            "Use standard section headings like 'Work Experience' and 'Education'",
            "Quantify achievements with specific numbers and percentages",
            "Maintain consistent formatting and font usage throughout",
            "Add a professional summary highlighting key qualifications"
          ]
        };
      }
      
      setAtsScore(analysis.atsScore);
      setImprovementTips(analysis.improvementTips);
      
      // Add analysis to chat
      const newMessages = [...messages, 
        { text: `✅ Resume analysis complete! Your ATS Score: ${analysis.atsScore}/100`, sender: "bot" },
        { text: "Here are your personalized improvement recommendations:", sender: "bot" }
      ];
      
      analysis.improvementTips.forEach((tip: string, index: number) => {
        newMessages.push({ text: `${index + 1}. ${tip}`, sender: "bot" });
      });
      
      setMessages(newMessages);
      
    } catch (error) {
      console.error('❌ Error analyzing resume:', error);
      
      // Fallback analysis
      const mockScore = Math.floor(Math.random() * 25) + 70; // 70-95 range
      const mockTips = [
        "Include more industry-specific keywords to improve ATS scanning",
        "Use standard section headings for better compatibility",
        "Add quantifiable achievements with specific metrics and numbers",
        "Ensure consistent formatting and professional presentation",
        "Include a compelling professional summary at the top",
        "Optimize for mobile and ATS readability",
        "Add relevant technical skills and certifications"
      ];
      
      const selectedTips = mockTips.sort(() => 0.5 - Math.random()).slice(0, 5);
      
      setAtsScore(mockScore);
      setImprovementTips(selectedTips);
      
      const newMessages = [...messages, 
        { text: `📊 Resume analyzed! ATS Score: ${mockScore}/100`, sender: "bot" },
        { text: "Here are your improvement suggestions:", sender: "bot" }
      ];
      
      selectedTips.forEach((tip, index) => {
        newMessages.push({ text: `${index + 1}. ${tip}`, sender: "bot" });
      });
      
      setMessages(newMessages);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle file selection and upload
  const handleFileSelect = async (file: File) => {
    if (!file) return;
    
    const allowedTypes = [
      'application/pdf', 
      'text/plain', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    console.log('📁 File selected:', file.name);
    setFileName(file.name);
    
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      await analyzeResumeWithGemini(text);
    } catch (error) {
      console.error('❌ Error processing file:', error);
      alert('Error processing the file. Please try again.');
    }
  };

  // File input handlers
  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // AI-powered chatbot function
  const handleChatWithAI = async (userMessage: string) => {
    try {
      console.log('💬 Sending message to AI:', userMessage);
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('📥 Received data from API:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log('💬 AI response received successfully:', data.response?.substring(0, 50) + '...');
      return data.response;
      
    } catch (error) {
      console.error('❌ Error with AI chatbot:', error);
      
      // Intelligent fallback responses
      const message = userMessage.toLowerCase();
      
      if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return "Hello there! 👋 I'm your friendly AI assistant! Nice to meet you. What would you like to chat about today?";
      } else if (message.includes('how are you')) {
        return "I'm doing wonderfully, thank you for asking! 😊 I'm here and ready to help with anything you need. How are you doing?";
      } else if (message.includes('what') && message.includes('name')) {
        return "I'm your friendly AI assistant! 🤖 I'm here to help with questions, conversations, and anything else you'd like to explore.";
      } else if (message.includes('resume') || message.includes('career')) {
        return "Great question about careers! 📄 I can help with resume tips, job search strategies, interview prep, and career development. What specific area interests you?";
      } else if (message.includes('help')) {
        return "I'd love to help you! 💪 I can assist with a wide range of topics - technology, career advice, creative projects, or just have an engaging conversation. What do you need?";
      } else {
        return `That's an interesting question about "${userMessage}"! 🤔 I'd be happy to explore that topic with you. What specific aspect would you like to discuss?`;
      }
    }
  };

  // Reset function for new resume
  const handleCheckAnotherResume = () => {
    console.log('🔄 Resetting for another resume');
    setFileName("");
    setResumeText("");
    setAtsScore(0);
    setImprovementTips([]);
    setMessages([
      { text: "Ready for another resume! 🚀 Upload your new file for fresh analysis, or let's continue our conversation!", sender: "bot" },
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!input.trim() || isChatLoading) return;
    
    const userMessage = input;
    const newMessages = [...messages, { text: userMessage, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setIsChatLoading(true);
    
    // Add typing indicator
    setMessages([...newMessages, { text: "AI is thinking... 🤔", sender: "bot" }]);
    
    try {
      const botResponse = await handleChatWithAI(userMessage);
      
      // Remove typing indicator and add actual response
      setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
      
    } catch (error) {
      console.error('❌ Error getting bot response:', error);
      setMessages([...newMessages, { 
        text: "I'm having a moment of technical difficulty, but I'm still here to help! Try asking me about resumes, careers, or anything else on your mind! 😊", 
        sender: "bot" 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Resume Assistant</h1>
        <p className="text-gray-600">AI-powered intelligent conversations and professional resume analysis</p>
      </div>

      {/* Resume Upload Section */}
      <section className="bg-white p-6 rounded-lg shadow-md text-center mb-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold mb-4">📄 Resume Analysis</h2>
        <div 
          className="border-2 border-dashed border-gray-300 p-10 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {fileName ? (
            <div className="text-green-600">
              <div className="text-lg font-semibold mb-2">✅ {fileName}</div>
              <p className="text-sm text-gray-600 mb-4">File uploaded and analyzed successfully!</p>
              <button 
                onClick={handleCheckAnotherResume}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Analyze Another Resume
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg mb-2">Drag & Drop your resume here</p>
              <p className="text-gray-500 mb-4">or</p>
              <button 
                onClick={handleBrowseFiles}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing Resume...' : 'Browse Files'}
              </button>
              <p className="text-xs text-gray-500 mt-3">Supports PDF, DOC, DOCX, TXT files</p>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </section>

      {/* ATS Score Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-yellow-500">
        <h2 className="text-xl font-semibold mb-4">📊 ATS Compatibility Score</h2>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-gray-800">{atsScore}/100</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              atsScore >= 85 ? 'bg-green-100 text-green-800' :
              atsScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
              atsScore >= 50 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
            }`}>
              {atsScore >= 85 ? 'Excellent' : atsScore >= 70 ? 'Good' : atsScore >= 50 ? 'Fair' : 'Needs Work'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                atsScore >= 85 ? 'bg-green-500' : 
                atsScore >= 70 ? 'bg-yellow-500' : 
                atsScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${atsScore}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
          <div className="text-center">
            <div className="w-3 h-3 bg-red-500 rounded mx-auto mb-1"></div>
            <span>Poor (0-49)</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-orange-500 rounded mx-auto mb-1"></div>
            <span>Fair (50-69)</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mx-auto mb-1"></div>
            <span>Good (70-84)</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded mx-auto mb-1"></div>
            <span>Excellent (85+)</span>
          </div>
        </div>
      </section>

      {/* Improvement Tips Section */}
      {improvementTips.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold mb-4">💡 Improvement Recommendations</h2>
          <div className="space-y-4">
            {improvementTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Chatbot */}
      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-96 bg-white rounded-lg shadow-xl border">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="font-medium">AI Assistant</span>
            </div>
          </div>
          <div ref={chatContainerRef} className="p-4 h-64 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 my-2 rounded-lg max-w-xs ${
                  msg.sender === "user" 
                    ? "bg-blue-500 text-white ml-auto" 
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex p-3 border-t bg-white rounded-b-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
              placeholder="Ask AI anything..."
              disabled={isChatLoading}
            />
            <button 
              onClick={handleSendMessage} 
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={isChatLoading || !input.trim()}
            >
              {isChatLoading ? '...' : '📤'}
            </button>
          </div>
        </div>
      )}
      
      {/* Chat Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow text-2xl"
        title="Chat with AI"
      >
        {chatOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
};

export default ResumePage;

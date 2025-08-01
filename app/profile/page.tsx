'use client'
import React, { useState, useRef } from 'react';

const ProfilePage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("/profile.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-cover bg-center pt-16" style={{backgroundImage: "url('/bmhome.jpg')"}}>
      <div className="max-w-5xl mx-auto p-5">
        {/* Profile Header */}
        <header className="bg-white rounded-lg shadow-sm mb-5">
          <div className="h-48 w-full bg-cover bg-center" style={{backgroundImage: "url('/cover-pic.png')"}}></div>
          <div className="relative text-center p-5">
            <div className="relative inline-block">
              <img 
                src={profilePhoto} 
                alt="Profile" 
                className="w-36 h-36 object-cover rounded-full border-2 border-gray-300 mx-auto -mt-16"
              />
              <button
                onClick={handleChangePhoto}
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                title="Change profile photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <h1 className="text-3xl font-bold mt-3 text-gray-900">Devraj Rana</h1>
            <p className="text-xl text-gray-700">Student of BCA at COER University</p>
            <p className="text-gray-600 mb-5">📍 UTTRAKHAND, INDIA</p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleConnect}
                className={`rounded-full px-6 py-2 font-semibold ${isConnected ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                {isConnected ? 'Pending' : 'Connect'}
              </button>
              <button className="rounded-full px-6 py-2 font-semibold border border-blue-600 text-blue-600 bg-white">
                Message
              </button>
              <a href="/resume.html">
                <button className="rounded px-6 py-2 font-semibold bg-green-600 text-white">
                  ATS Checker
                </button>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-3 gap-5">
          {/* Left Column (2/3 width) */}
          <div className="col-span-2 space-y-5">
            <section className="bg-white rounded-lg p-5 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700">
                A driven Bachelor of Computer Applications student at COER University, Roorkee (2023-2026), skilled in Python (NumPy, Pandas), Java, C++, C, and database tool-; like MySQL and MS Excel. Completed a Python Developer Internship at lntemPe, developing projects like Snake Game and Digital Clock, and certified in JavaScript and computing fundamentals. Demonstrated leadership by managing and presenting the &quot;COER Atlas&quot; project, securing 3rd place at Ideathon 2024 and showcasing it at Bharat Gyan Sama gam 2024. Strong in problem-solving, teamwork, and time management, seeking opportunities to innovate and grow in dynamic environments.
              </p>
            </section>

            <section className="bg-white rounded-lg p-5 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Experience</h2>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold">Bachelor of Computer Applications Student</h3>
                <p className="text-gray-700">
                  <strong>JavaScript Training Program, Udemy</strong> - Completed a 10-day program on JavaScript fundamentals, including syntax and practical applications.
                </p>
                <p className="text-gray-700">
                  <strong>Python Developer Intern, lnternPe</strong> - Developed Python projects, including Snake Game, Digital Clock, Tic_Tac_Toc, and 4 Dot Game. Improved problem-solving, debugging, and teamwork skills.
                </p>
              </div>
            </section>

            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Personal Information</h3>
              <p className="text-gray-700">Name:Devraj Rana</p>
              <p className="text-gray-700">Profession: Student</p>
              <p className="text-gray-700">Contact_number: 6398056513</p>
              <p className="text-gray-700">Email: devrajrana@gmail.com</p>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-start mb-5">
                <img src={profilePhoto} alt="" className="w-8 h-8 rounded-full mr-3" />
                <div>
                  <h3 className="text-lg font-bold">Devraj Rana</h3>
                  <p className="text-sm text-gray-600">COER University Roorkee</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Ideathon-2024, COER University Roorkee, Uttarakhand· Led the team in presenting the project &quot;COER Altas: Personalized Map of My College,&quot; securing 3rd place in the competition project-COER Atlas a Personalized map for the vistiors and freshers.
              </p>
              <img src="/Screenshot (80).png" alt="Project Screenshot" className="w-full mb-4" />
              
              <div className="flex justify-between items-center py-2 border-b border-gray-300">
                <div className="flex items-center">
                  <img src="/thumbsup.png" alt="" className="w-4 h-4" />
                  <img src="/love.png" alt="" className="w-4 h-4 -ml-1" />
                  <img src="/clap.png" alt="" className="w-4 h-4 -ml-1" />
                  <span className="text-sm text-gray-600 ml-2">Adam Doe and 89 others</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">22 comments · 40 shares</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <div className="flex items-center">
                  <img src={profilePhoto} alt="" className="w-6 h-6 rounded-full" />
                  <img src="/down-arrow.png" alt="" className="w-3 h-3 ml-1" />
                </div>
                <div className="flex items-center">
                  <img src="/like.png" alt="" className="w-5 h-5 mr-2" />
                  <span className="text-sm text-gray-700">Like</span>
                </div>
                <div className="flex items-center">
                  <img src="/comment.png" alt="" className="w-5 h-5 mr-2" />
                  <span className="text-sm text-gray-700">Comment</span>
                </div>
                <div className="flex items-center">
                  <img src="/share.png" alt="" className="w-5 h-5 mr-2" />
                  <span className="text-sm text-gray-700">Share</span>
                </div>
                <div className="flex items-center">
                  <img src="/send.png" alt="" className="w-5 h-5 mr-2" />
                  <span className="text-sm text-gray-700">Send</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <aside className="col-span-1 space-y-5">
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Education</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold">2023-2026 Bachelor of Computer Applications, COER University Roorkee, Uttarakhand</h4>
                  <p className="text-gray-700">Currently pursuing a Bachelor of Computer Applications (BCA) at COER University, Roorkee, Uttarakhand (2023-2026), focusing on [specific area, e.g., software development, data analytics, etc.]</p>
                </div>
                <div>
                  <h4 className="text-md font-semibold">2022-2023 Mahi International School Agra, Uttar Pradesh</h4>
                  <p className="text-gray-700">Science with Mathematics, Completed Intermediate education from Mahi International School, Agra, Uttar Pradesh CBSE Board in 2023.</p>
                </div>
                <div>
                  <h4 className="text-md font-semibold">2019-2020 Army Public School Agra, Uttar Pradesh</h4>
                  <p className="text-gray-700">Completed High School education from Army Public School, Agra, Uttar Pradesh CBSE Board in 2021.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Skills</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Python</span>
                  <span className="text-gray-600">99+</span>
                </li>
                <li className="flex justify-between">
                  <span>C language</span>
                  <span className="text-gray-600">99+</span>
                </li>
                <li className="flex justify-between">
                  <span>HTML & CSS</span>
                  <span className="text-gray-600">99+</span>
                </li>
                <li className="flex justify-between">
                  <span>JAVA</span>
                  <span className="text-gray-600">87</span>
                </li>
                <li className="flex justify-between">
                  <span>C++</span>
                  <span className="text-gray-600">76</span>
                </li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
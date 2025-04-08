'use client'
import { useState } from "react";

const page = () => {
  const [atsScore, setAtsScore] = useState(80);
  const [messages, setMessages] = useState([
    { text: "Welcome! Ask me about resume tips.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, sender: "user" }];
    newMessages.push({ text: "Optimize your resume with keywords.", sender: "bot" });
    setMessages(newMessages);
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-12">
      {/* Resume Upload Section */}
      <section className="bg-white p-6 rounded-lg shadow-md text-center mb-6">
        <h1 className="text-2xl font-bold mb-4">Smart Resume Assistant</h1>
        <div className="border-2 border-dashed border-gray-300 p-10 rounded-lg cursor-pointer hover:border-blue-500">
          <p className="text-gray-600">Drag & Drop your resume here</p>
          <p className="text-gray-500">or</p>
          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg">Browse Files</button>
        </div>
      </section>

      {/* ATS Score Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold">ATS Score: {atsScore}/100</h2>
        <div className="w-full h-4 bg-gray-200 rounded-lg mt-2">
          <div className="h-4 bg-blue-500 rounded-lg" style={{ width: `${atsScore}%` }}></div>
        </div>
      </section>

      {/* Chatbot */}
      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-lg">
          <div className="bg-blue-500 text-white p-3 rounded-t-lg">Resume Assistant</div>
          <div className="p-4 h-60 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 my-1 rounded-lg w-fit max-w-xs ${
                  msg.sender === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex p-3 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow p-2 border rounded-lg"
              placeholder="Ask about resume tips..."
            />
            <button onClick={handleSendMessage} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center"
      >
        💬
      </button>
    </div>
  );
};

export default page;

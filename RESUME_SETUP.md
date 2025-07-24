# Resume Analysis with Gemini API Setup

## 🚀 Getting Started with Gemini API

### Step 1: Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variables
1. Open the `.env.local` file in your project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

### Step 3: Restart Development Server
After adding the API key, restart your Next.js development server:
```bash
npm run dev
```

## 📋 Features Implemented

### File Upload System
- **Drag & Drop**: Drag resume files directly onto the upload area
- **Browse Files**: Click "Browse Files" to open file manager
- **Supported Formats**: PDF, DOC, DOCX, TXT files
- **File Validation**: Automatically validates file types

### ATS Scoring System
- **Real-time Analysis**: Uses Gemini AI to analyze resume content
- **Score Visualization**: Color-coded progress bar (Red: 0-40, Yellow: 41-70, Green: 71-100)
- **Detailed Breakdown**: Shows score ranges for different performance levels

### Improvement Tips
- **AI-Generated Tips**: Gemini provides personalized improvement suggestions
- **Numbered List**: Easy-to-follow improvement recommendations
- **Visual Design**: Clean card-based layout for better readability

### Smart Chatbot
- **Interactive Assistant**: Ask questions about resume optimization
- **Context-Aware**: Responds with relevant resume improvement advice
- **Persistent Chat**: Maintains conversation history during session

## 🔧 Technical Implementation

### File Processing
```typescript
// Handles multiple file formats
const handleFileSelect = async (file: File) => {
  const allowedTypes = ['application/pdf', 'text/plain', 'application/msword'];
  // Process and extract text content
};
```

### AI Analysis
```typescript
// Gemini API integration for resume analysis
const analyzeResumeWithGemini = async (resumeContent: string) => {
  // Sends structured prompt to Gemini
  // Receives ATS score and improvement tips
};
```

### Fallback System
- **Error Handling**: If API fails, provides mock analysis
- **Offline Mode**: Generates realistic sample scores and tips
- **User Experience**: Seamless operation regardless of API status

## 🎯 Usage Instructions

1. **Upload Resume**: 
   - Drag and drop your resume file
   - OR click "Browse Files" to select from file manager

2. **Wait for Analysis**: 
   - System extracts text from your resume
   - Gemini AI analyzes content for ATS compatibility

3. **Review Results**:
   - Check your ATS score (0-100)
   - Read personalized improvement tips
   - Use chatbot for additional guidance

4. **Implement Improvements**:
   - Follow the numbered improvement suggestions
   - Re-upload updated resume to see score changes

## 🔒 Privacy & Security
- **No Data Storage**: Resume content is processed but not stored
- **Secure API**: All API calls use HTTPS encryption
- **Local Processing**: File handling happens in your browser

## 🛠️ Troubleshooting

### Common Issues:
1. **API Key Error**: Make sure you've added your Gemini API key to `.env.local`
2. **File Upload Issues**: Check that your file is in supported format (PDF, DOC, DOCX, TXT)
3. **Analysis Fails**: System will fallback to mock analysis if API is unavailable

### Need Help?
- Check browser console for error messages
- Ensure your API key has proper permissions
- Try with a simple text file first to test functionality

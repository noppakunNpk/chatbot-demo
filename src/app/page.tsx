'use client';
// pages/index.tsx
import { useState } from 'react';
import Head from 'next/head';

// ประเภทข้อมูลสำหรับข้อความแชท
type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

// ฟังก์ชันสำหรับตอบกลับตามเคสที่กำหนด
const generateResponse = (text: string): string => {
  // แปลงข้อความเป็นตัวพิมพ์เล็กและลบช่องว่างหน้า-หลัง เพื่อง่ายต่อการตรวจสอบ
  const userMessage = text.toLowerCase().trim();
  
  // เคสสำหรับคำทักทาย
  if (userMessage.includes('สวัสดี') || userMessage.includes('หวัดดี') || userMessage === 'hi' || userMessage === 'hello') {
    return "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?";
  }
  
  // เคสสำหรับคำถามวันที่
  if (userMessage.includes('วันนี้วันอะไร') || userMessage.includes('วันอะไร') || userMessage.includes('วันนี้')) {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const today = new Date();
    const thaiDay = days[today.getDay()];
    return `วันนี้เป็น${thaiDay}ครับ (${today.toLocaleDateString('th-TH')})`;
  }
  
  // เคสสำหรับคำถามเวลา
  if (userMessage.includes('กี่โมง') || userMessage.includes('เวลา')) {
    const now = new Date();
    return `ขณะนี้เวลา ${now.toLocaleTimeString('th-TH')} น. ครับ`;
  }
  
  // เคสสำหรับการแนะนำตัว
  if (userMessage.includes('คุณคือใคร') || userMessage.includes('ชื่ออะไร') || userMessage.includes('แนะนำตัว')) {
    return "ผมคือแชทบอทอย่างง่าย สร้างด้วย Next.js และ TypeScript ครับ";
  }
  
  // เคสสำหรับการขอบคุณ
  if (userMessage.includes('ขอบคุณ') || userMessage.includes('thank')) {
    return "ยินดีครับ หากมีคำถามอื่นๆ สามารถถามได้เลยครับ";
  }
  
  // เคสสำหรับการลา
  if (userMessage.includes('ลาก่อน') || userMessage.includes('บาย') || userMessage === 'bye') {
    return "ขอบคุณที่ใช้บริการครับ แล้วพบกันใหม่";
  }
  
  // คำตอบทั่วไปกรณีไม่ตรงกับเคสใดๆ
  const defaultResponses = [
    "ขออภัยครับ ผมไม่เข้าใจคำถาม ช่วยถามใหม่ได้ไหมครับ?",
    "น่าสนใจครับ คุณช่วยอธิบายเพิ่มเติมได้ไหม?",
    "ตอนนี้ผมยังตอบคำถามนี้ไม่ได้ครับ ทีมงานกำลังพัฒนาความสามารถเพิ่มเติมอยู่",
    "คุณสามารถลองถามคำถามอื่นได้ไหมครับ?",
    "หากต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อได้ที่อีเมล support@example.com",
  ];
  
  // สุ่มคำตอบทั่วไปกรณีไม่ตรงกับเคสใดๆ
  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  return defaultResponses[randomIndex];
};

export default function Home() {
  // สถานะสำหรับเก็บข้อความและข้อความที่กำลังพิมพ์
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "สวัสดีครับ ยินดีต้อนรับสู่ระบบแชทบอทอย่างง่าย", sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // ฟังก์ชันสำหรับส่งข้อความ
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    // เพิ่มข้อความของผู้ใช้
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
    };
    
    setMessages([...messages, newUserMessage]);
    setInputText('');
    setIsTyping(true);
    
    // จำลองการตอบกลับของบอทหลังจากรอ 1 วินาที
    setTimeout(() => {
      // สร้างคำตอบตามเคสที่กำหนด
      const botResponseText = generateResponse(inputText);
      const botReply: Message = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
      };
      
      setMessages(prevMessages => [...prevMessages, botReply]);
      setIsTyping(false);
    }, 1000);
  };

  // ฟังก์ชันสำหรับการกด Enter เพื่อส่งข้อความ
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Head>
        <title>Simple NextJS Chatbot</title>
        <meta name="description" content="A simple chatbot demo with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">chatbot DEMO</h1>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
          {/* ส่วนแสดงข้อความแชท */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-left mb-4">
                <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                  <span className="animate-pulse">กำลังพิมพ์...</span>
                </div>
              </div>
            )}
          </div>

          {/* ส่วนกล่องข้อความและปุ่มส่ง */}
          <div className="border-t border-gray-200 p-4 flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความของคุณ..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
            >
              ส่ง
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white text-center p-4">
        <p>© 2025 แชทบอทอย่างง่าย - สร้างด้วย Next.js และ TypeScript</p>
      </footer>
    </div>
  );
}
'use client';
// pages/index.tsx
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import useConversation from '../hooks/useConversation';

export default function Home() {
  const {
    messages,
    inputText,
    isTyping,
    showOptions,
    currentOptions,
    setInputText,
    handleSendMessage,
    handleKeyPress,
    handleOptionSelect
  } = useConversation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Head>
        <title>ที่ปรึกษาประกันออนไลน์</title>
        <meta name="description" content="บริการให้คำปรึกษาด้านประกันแบบส่วนตัว" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Insure Thai - ที่ปรึกษาประกันออนไลน์</h1>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4">
        <ChatInterface
          messages={messages}
          inputText={inputText}
          isTyping={isTyping}
          showOptions={showOptions}
          currentOptions={currentOptions}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          handleOptionSelect={handleOptionSelect}
        />
      </main>

      <footer className="bg-gray-800 text-white text-center p-4">
        <p>© 2025 Insure Thai - ที่ปรึกษาประกันออนไลน์ | สร้างด้วย Next.js และ TypeScript</p>
      </footer>
    </div>
  );
}
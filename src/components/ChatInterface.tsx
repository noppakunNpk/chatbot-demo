// components/ChatInterface.tsx
import React from 'react';
import { Message } from '../data/insuranceData';

interface ChatInterfaceProps {
  messages: Message[];
  inputText: string;
  isTyping: boolean;
  showOptions: boolean;
  currentOptions: string[];
  setInputText: (text: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleOptionSelect: (option: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputText,
  isTyping,
  showOptions,
  currentOptions,
  setInputText,
  handleSendMessage,
  handleKeyPress,
  handleOptionSelect
}) => {
  return (
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
              className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text.split('\n').map((line, i) => (
                <div key={i}>{line || <br />}</div>
              ))}
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

      {/* ส่วนแสดงตัวเลือก */}
      {showOptions && currentOptions.length > 0 && (
        <div className="border-t border-gray-200 p-3 flex flex-wrap gap-2">
          {currentOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors text-sm"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* ส่วนกล่องข้อความและปุ่มส่ง */}
      <div className="border-t border-gray-200 p-4 flex">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="พิมพ์ข้อความของคุณ..."
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={showOptions}
        />
        <button
          onClick={handleSendMessage}
          className={`${showOptions ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-6 py-2 rounded-r-lg transition-colors`}
          disabled={showOptions}
        >
          ส่ง
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
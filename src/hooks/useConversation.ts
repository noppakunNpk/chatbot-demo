// hooks/useConversation.ts
import { useState, useEffect } from 'react';
import { 
  Message, 
  CustomerInfo, 
  ConversationState, 
  InsurancePackage 
} from '../data/insuranceData';
import { insurancePackages } from '../data/insurancePackages';
import { 
  calculateRecommendedPackages, 
  parseNumber, 
  generatePackageDetailsMessage,
  isAffirmativeResponse,
  isNegativeResponse
} from '../utils/chatUtils';

export const useConversation = () => {
  // สถานะสำหรับเก็บข้อความและข้อความที่กำลังพิมพ์
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.GREETING);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    age: null,
    income: null,
    monthlyBudget: null,
    hasExistingInsurance: null,
    healthConcerns: [],
    familyStatus: ''
  });
  const [recommendedPackages, setRecommendedPackages] = useState<InsurancePackage[]>([]);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // ฟังก์ชันสำหรับเพิ่มข้อความของบอท
  const addBotMessage = (text: string, options?: string[]) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: 'bot',
      options
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    if (options && options.length > 0) {
      setShowOptions(true);
      setCurrentOptions(options);
    } else {
      setShowOptions(false);
      setCurrentOptions([]);
    }
  };

  // ฟังก์ชันสำหรับเพิ่มข้อความของผู้ใช้
  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user'
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  // ฟังก์ชันสำหรับประมวลผลคำตอบของผู้ใช้
  const processUserResponse = (response: string) => {
    switch (conversationState) {
      case ConversationState.ASK_NAME:
        setCustomerInfo(prev => ({ ...prev, name: response }));
        setConversationState(ConversationState.ASK_AGE);
        break;
      
      case ConversationState.ASK_AGE:
        const age = parseNumber(response);
        if (age === null) {
          addBotMessage('ขอโทษค่ะ ดิฉันไม่เข้าใจ กรุณาระบุอายุเป็นตัวเลขค่ะ เช่น 35');
          return;
        }
        setCustomerInfo(prev => ({ ...prev, age }));
        setConversationState(ConversationState.ASK_INCOME);
        break;
      
      case ConversationState.ASK_INCOME:
        const income = parseNumber(response);
        if (income === null) {
          addBotMessage('ขอโทษค่ะ ดิฉันไม่เข้าใจ กรุณาระบุรายได้เป็นตัวเลขค่ะ เช่น 30000');
          return;
        }
        setCustomerInfo(prev => ({ ...prev, income }));
        setConversationState(ConversationState.ASK_MONTHLY_BUDGET);
        break;
      
      case ConversationState.ASK_MONTHLY_BUDGET:
        const budget = parseNumber(response);
        if (budget === null) {
          addBotMessage('ขอโทษค่ะ ดิฉันไม่เข้าใจ กรุณาระบุงบประมาณเป็นตัวเลขค่ะ เช่น 1500');
          return;
        }
        setCustomerInfo(prev => ({ ...prev, monthlyBudget: budget }));
        setConversationState(ConversationState.ASK_EXISTING_INSURANCE);
        break;
      
      case ConversationState.ASK_EXISTING_INSURANCE:
        const hasInsurance = isAffirmativeResponse(response);
        setCustomerInfo(prev => ({ ...prev, hasExistingInsurance: hasInsurance }));
        setConversationState(ConversationState.ASK_HEALTH_CONCERNS);
        break;
      
      case ConversationState.ASK_HEALTH_CONCERNS:
        let concerns: string[] = [];
        if (!isNegativeResponse(response)) {
          concerns = response.split(',').map(concern => concern.trim());
        }
        setCustomerInfo(prev => ({ ...prev, healthConcerns: concerns }));
        setConversationState(ConversationState.ASK_FAMILY_STATUS);
        break;
      
      case ConversationState.ASK_FAMILY_STATUS:
        setCustomerInfo(prev => ({ ...prev, familyStatus: response }));
        setConversationState(ConversationState.RECOMMEND_INSURANCE);
        break;
      
      case ConversationState.PROVIDE_MORE_INFO:
        if (isAffirmativeResponse(response)) {
          setConversationState(ConversationState.END_CONVERSATION);
        } else {
          // กลับไปหน้าแนะนำแพ็คเกจ
          setConversationState(ConversationState.RECOMMEND_INSURANCE);
        }
        break;
      
      case ConversationState.RECOMMEND_INSURANCE:
        if (selectedPackageId) {
          // ถ้ามีการเลือกแพ็คเกจแล้ว
          if (isAffirmativeResponse(response)) {
            setConversationState(ConversationState.END_CONVERSATION);
          } else {
            setSelectedPackageId(null);
            addBotMessage('ต้องการดูแพ็คเกจอื่นหรือไม่คะ?', ['ใช่, อยากดูแพ็คเกจอื่น', 'ไม่, ขอบคุณค่ะ']);
          }
        } else {
          // ถ้ายังไม่ได้เลือกแพ็คเกจ และมีการเลือกตัวเลือก
          const packageId = recommendedPackages.find(pkg => 
            response.includes(pkg.name)
          )?.id;
          
          if (packageId) {
            setSelectedPackageId(packageId);
            const detailsMessage = generatePackageDetailsMessage(packageId);
            
            addBotMessage(detailsMessage);
            addBotMessage('คุณสนใจสมัครแพ็คเกจนี้หรือไม่คะ?', ['สนใจ, ต้องการสมัคร', 'ไม่สนใจ, ขอดูแพ็คเกจอื่น']);
          } else if (isNegativeResponse(response)) {
            setConversationState(ConversationState.END_CONVERSATION);
          } else {
            addBotMessage('ขอโทษค่ะ ดิฉันไม่เข้าใจคำตอบ กรุณาเลือกจากตัวเลือกที่ให้ค่ะ');
          }
        }
        break;
      
      case ConversationState.END_CONVERSATION:
        // รีเซ็ตการสนทนาใหม่หากต้องการ
        if (response.toLowerCase().includes('ใหม่') || response.toLowerCase().includes('start')) {
          resetConversation();
        }
        break;
        
      case ConversationState.GREETING:
      default:
        setConversationState(ConversationState.ASK_NAME);
        break;
    }
  };

  // ฟังก์ชันสำหรับส่งข้อความ
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    addUserMessage(inputText);
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => {
      processUserResponse(inputText);
      setIsTyping(false);
    }, 1000);
  };

  // ฟังก์ชันสำหรับเลือกตัวเลือก
  const handleOptionSelect = (option: string) => {
    addUserMessage(option);
    setShowOptions(false);
    setIsTyping(true);
    
    setTimeout(() => {
      processUserResponse(option);
      setIsTyping(false);
    }, 1000);
  };

  // ฟังก์ชันสำหรับการกด Enter เพื่อส่งข้อความ
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // ฟังก์ชันเริ่มต้นการสนทนา
  const initiateConversation = () => {
    addBotMessage('สวัสดีค่ะ ดิฉันเป็นผู้ช่วยให้คำปรึกษาด้านประกันออนไลน์ ยินดีให้คำแนะนำเกี่ยวกับแผนประกันที่เหมาะกับคุณค่ะ');
    setConversationState(ConversationState.ASK_NAME);
  };

  // ฟังก์ชันรีเซ็ตการสนทนา
  const resetConversation = () => {
    setConversationState(ConversationState.GREETING);
    setCustomerInfo({
      name: '',
      age: null,
      income: null,
      monthlyBudget: null,
      hasExistingInsurance: null,
      healthConcerns: [],
      familyStatus: ''
    });
    setMessages([]);
    initiateConversation();
  };

  // ฟังก์ชันสำหรับอัพเดทคำถามตามสถานะการสนทนา
  useEffect(() => {
    switch (conversationState) {
      case ConversationState.ASK_NAME:
        addBotMessage('กรุณาแนะนำชื่อของคุณค่ะ');
        break;
      
      case ConversationState.ASK_AGE:
        addBotMessage(`คุณ${customerInfo.name} กรุณาระบุอายุของคุณค่ะ`);
        break;
      
      case ConversationState.ASK_INCOME:
        addBotMessage('กรุณาระบุรายได้ต่อเดือนของคุณค่ะ (บาท)');
        break;
      
      case ConversationState.ASK_MONTHLY_BUDGET:
        addBotMessage('คุณสามารถจัดสรรงบประมาณเพื่อจ่ายเบี้ยประกันได้เดือนละเท่าไรคะ? (บาท)');
        break;
      
      case ConversationState.ASK_EXISTING_INSURANCE:
        addBotMessage('คุณมีประกันอยู่แล้วหรือไม่คะ?', ['มี', 'ไม่มี']);
        break;
      
      case ConversationState.ASK_HEALTH_CONCERNS:
        addBotMessage('คุณมีความกังวลด้านสุขภาพเรื่องใดหรือไม่คะ? (หากมีหลายเรื่อง กรุณาคั่นด้วยเครื่องหมายคอมม่า)');
        break;
      
      case ConversationState.ASK_FAMILY_STATUS:
        addBotMessage('กรุณาระบุสถานะครอบครัวของคุณค่ะ', ['โสด', 'มีครอบครัว', 'แต่งงานแล้วยังไม่มีบุตร', 'มีบุตร']);
        break;
      
      case ConversationState.RECOMMEND_INSURANCE:
        const packages = calculateRecommendedPackages(customerInfo);
        setRecommendedPackages(packages);
        
        if (packages.length === 0) {
          addBotMessage(`ขอบคุณสำหรับข้อมูลค่ะ คุณ${customerInfo.name} ขณะนี้เรายังไม่มีแพ็คเกจที่เหมาะสมกับความต้องการของคุณ หากคุณต้องการคำแนะนำเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่ของเราที่เบอร์ 02-123-4567 ค่ะ`);
          setConversationState(ConversationState.END_CONVERSATION);
        } else {
          let message = `ขอบคุณสำหรับข้อมูลค่ะ คุณ${customerInfo.name} จากข้อมูลที่คุณให้มา ดิฉันขอแนะนำแพ็คเกจประกันที่เหมาะกับคุณ ${packages.length} แพ็คเกจค่ะ\n\n`;
          
          const packageOptions = packages.map(pkg => {
            message += `${pkg.name} - ${pkg.monthlyCost.toLocaleString()} บาท/เดือน\n`;
            return `${pkg.name} - ${pkg.monthlyCost.toLocaleString()} บาท/เดือน`;
          });
          
          message += '\nกรุณาเลือกแพ็คเกจที่ต้องการดูรายละเอียดเพิ่มเติมค่ะ';
          addBotMessage(message, [...packageOptions, 'ไม่สนใจแพ็คเกจใด']);
        }
        break;
      
      case ConversationState.END_CONVERSATION:
        if (selectedPackageId) {
          const selectedPackage = insurancePackages.find(pkg => pkg.id === selectedPackageId);
          if (selectedPackage) {
            addBotMessage(`ขอบคุณที่สนใจแพ็คเกจ ${selectedPackage.name} ค่ะ คุณ${customerInfo.name} ทีมงานของเราจะติดต่อกลับไปเพื่อดำเนินการต่อภายใน 24 ชั่วโมง หรือหากมีข้อสงสัยเพิ่มเติม สามารถติดต่อเราได้ที่เบอร์ 02-123-4567 ค่ะ`);
            addBotMessage('หากต้องการเริ่มการสนทนาใหม่ กรุณาพิมพ์ "เริ่มใหม่" ค่ะ');
          }
        } else {
          addBotMessage(`ขอบคุณที่ใช้บริการค่ะ คุณ${customerInfo.name} หากมีข้อสงสัยหรือต้องการคำแนะนำเพิ่มเติม สามารถติดต่อเราได้ที่เบอร์ 02-123-4567 ค่ะ`);
          addBotMessage('หากต้องการเริ่มการสนทนาใหม่ กรุณาพิมพ์ "เริ่มใหม่" ค่ะ');
        }
        break;
    }
  }, [conversationState]);

  // เริ่มต้นการสนทนาเมื่อโหลดหน้า
  useEffect(() => {
    initiateConversation();
  }, []);

  return {
    messages,
    inputText,
    isTyping,
    showOptions,
    currentOptions,
    setInputText,
    handleSendMessage,
    handleKeyPress,
    handleOptionSelect
  };
};

export default useConversation;
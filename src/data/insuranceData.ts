// data/insuranceData.ts

// ประเภทข้อมูลสำหรับข้อความแชท
export type Message = {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    options?: string[]; // ตัวเลือกสำหรับคำตอบ
  };
  
  // ประเภทข้อมูลสำหรับข้อมูลลูกค้า
  export type CustomerInfo = {
    name: string;
    age: number | null;
    income: number | null;
    monthlyBudget: number | null;
    hasExistingInsurance: boolean | null;
    healthConcerns: string[];
    familyStatus: string;
  };
  
  // ประเภทข้อมูลสำหรับแพ็คเกจประกัน
  export type InsurancePackage = {
    id: string;
    name: string;
    description: string;
    monthlyCost: number;
    coverage: string[];
    suitableFor: string;
    minAge: number;
    maxAge: number;
    recommendedIncomeRange: [number, number]; // [min, max]
  };
  
  // สถานะของการสนทนา
  export enum ConversationState {
    GREETING,
    ASK_NAME,
    ASK_AGE,
    ASK_INCOME,
    ASK_MONTHLY_BUDGET,
    ASK_EXISTING_INSURANCE,
    ASK_HEALTH_CONCERNS,
    ASK_FAMILY_STATUS,
    RECOMMEND_INSURANCE,
    PROVIDE_MORE_INFO,
    END_CONVERSATION
  }
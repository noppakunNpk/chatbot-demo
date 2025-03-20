// utils/chatUtils.ts
import { InsurancePackage, CustomerInfo } from '../data/insuranceData';
import { insurancePackages } from '../data/insurancePackages';

// ฟังก์ชันสำหรับคำนวณแพ็คเกจประกันที่แนะนำ
export const calculateRecommendedPackages = (customerInfo: CustomerInfo): InsurancePackage[] => {
    if (customerInfo.age == null || customerInfo.income == null || customerInfo.monthlyBudget == null) {
      return [];
    }
  
    return insurancePackages.filter(pkg => {
      // ตรวจสอบว่าอายุอยู่ในช่วงที่เหมาะสม
      const ageMatches = (customerInfo.age ?? 0) >= pkg.minAge && (customerInfo.age ?? 0) <= pkg.maxAge;
      
      // ตรวจสอบว่างบประมาณรายเดือนเพียงพอ
      const budgetMatches = (customerInfo.monthlyBudget ?? 0) >= pkg.monthlyCost;
      
      // ตรวจสอบว่ารายได้อยู่ในช่วงที่แนะนำ
      const incomeMatches = (customerInfo.income ?? 0) >= pkg.recommendedIncomeRange[0] && 
                            (customerInfo.income ?? 0) <= pkg.recommendedIncomeRange[1];
      
      // เงื่อนไขเพิ่มเติมตามสถานะครอบครัว
      let extraCriteria = true;
      if (pkg.id === 'health-family' && customerInfo.familyStatus !== 'มีครอบครัว') {
        extraCriteria = false;
      }
      
      return ageMatches && budgetMatches && incomeMatches && extraCriteria;
    }).sort((a, b) => {
      // เรียงลำดับตามความเหมาะสมกับงบประมาณ (ใกล้กับงบประมาณมากที่สุด)
      const aDiff = Math.abs(a.monthlyCost - (customerInfo.monthlyBudget ?? 0));
      const bDiff = Math.abs(b.monthlyCost - (customerInfo.monthlyBudget ?? 0));
      return aDiff - bDiff;
    });
  };

// ฟังก์ชันสำหรับแปลงค่าตัวเลข
export const parseNumber = (value: string): number | null => {
  const cleaned = value.replace(/,/g, '');
  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
};

// ฟังก์ชันสำหรับสร้างข้อความรายละเอียดแพ็คเกจ
export const generatePackageDetailsMessage = (packageId: string): string => {
  const packageInfo = insurancePackages.find(pkg => pkg.id === packageId);
  
  if (!packageInfo) {
    return 'ไม่พบข้อมูลแพ็คเกจที่คุณเลือก';
  }
  
  let detailsMessage = `รายละเอียดแพ็คเกจ "${packageInfo.name}"\n\n`;
  detailsMessage += `${packageInfo.description}\n\n`;
  detailsMessage += `ค่าเบี้ยประกัน: ${packageInfo.monthlyCost.toLocaleString()} บาท/เดือน\n\n`;
  detailsMessage += `ความคุ้มครอง:\n`;
  packageInfo.coverage.forEach(item => {
    detailsMessage += `- ${item}\n`;
  });
  detailsMessage += `\nเหมาะสำหรับ: ${packageInfo.suitableFor}`;
  
  return detailsMessage;
};

// ฟังก์ชันสำหรับตรวจสอบว่าคำตอบมีความหมายเป็นใช่
export const isAffirmativeResponse = (response: string): boolean => {
  const lowerResponse = response.toLowerCase();
  return lowerResponse.includes('ใช่') || 
         lowerResponse.includes('yes') || 
         lowerResponse.includes('สนใจ') || 
         lowerResponse.includes('ต้องการ');
};

// ฟังก์ชันสำหรับตรวจสอบว่าคำตอบมีความหมายเป็นไม่
export const isNegativeResponse = (response: string): boolean => {
  const lowerResponse = response.toLowerCase();
  return lowerResponse.includes('ไม่') || 
         lowerResponse.includes('no');
};
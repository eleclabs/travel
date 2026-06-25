const ILLEGAL_TERMS = [
  "ยาเสพติด",
  "รับจ้างฟอกเงิน",
  "ขายบัญชีม้า",
  "พนันออนไลน์",
  "ค้าประเวณี",
  "อาวุธเถื่อน",
];

export function assertLegalProfileContent(values: string[]) {
  const content = values.join(" ").toLowerCase();
  const matched = ILLEGAL_TERMS.find((term) => content.includes(term));
  if (matched) {
    throw new Error(
      `เนื้อหามีคำที่ขัดต่อนโยบาย (${matched}) และไม่สามารถเผยแพร่ได้`
    );
  }
}

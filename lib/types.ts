export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ExtractedReceipt {
  vendor: string;
  date: string;
  items: ReceiptItem[];
  receiptTotal: number;
}

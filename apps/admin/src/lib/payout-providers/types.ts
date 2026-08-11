export interface PayoutBankAccount {
  bankName: string;
  accountNumber: string;
  accountType: string;
}

export interface PayoutParams {
  amount: number;
  recipientName: string;
  recipientDocumentType: string;
  recipientDocumentNumber: string;
  bankAccount: PayoutBankAccount;
  payoutCard: {
    cardNumber: string | null;
    alias: string | null;
    aliasType: string | null;
    expirationMonth: string | null;
    expirationYear: string | null;
  } | null;
  ruc: string;
  externalReferenceId: string;
  comment?: string;
}

export interface PayoutResult {
  success: boolean;
  transactionId: string | null;
  rawResponse: any;
}

export interface PayoutProvider {
  readonly name: string;
  processPayout(params: PayoutParams): Promise<PayoutResult>;
}

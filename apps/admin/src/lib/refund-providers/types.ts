export interface RefundParams {
  transactionId: string;
  amount: number;
  purchaseNumber: string;
  ruc?: string;
  comment?: string;
  externalReferenceId?: string;
}

export interface RefundResult {
  success: boolean;
  cancellationCode: string | null;
  rawResponse: any;
}

export interface RefundProvider {
  readonly id: string;
  refund(params: RefundParams): Promise<RefundResult>;
}

export type ApiResponse = {
    status: string;
    message: string;
    result: any[];
  };
  
export type TransactionCount = {
    [value: string]: number;
  };
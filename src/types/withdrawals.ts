
// 🔹 Withdrawal Type
export interface IWithdrawal {
  _id?: string;
  shopId?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role?: string;
    commissionBalance?: number;
  } | string; // either user object or userId string
  amount: number;
  paymentMethod: "cash-on" | "bKash" | "nagad" | "rocket" | "upay"; // backend supported methods
  paymentAccountNumber: string; // required by backend
  status?: "pending" | "approved" | "on-hold" | "processing" | "rejected" | string;
  description?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 🔹 Common API Response Type
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

interface ICreateTransferDTO {
  user_id: string;
  sender_id: string;
  description: string;
  amount: number;
}

export { ICreateTransferDTO }


import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

@injectable()
class CreateTransferUseCase {

  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {

  }
  async execute({ user_id, sender_id, description, amount }: ICreateTransferDTO) {
    const user = await this.usersRepository.findById(user_id);
    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }
    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds()
    }

    const statementWithdraw = await this.statementsRepository.create({
      user_id: sender_id,
      sender_id,
      type: OperationType.WITHDRAW,
      amount,
      description
    });
    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description
    });

    return statementOperation;
  }

}

export { CreateTransferUseCase }

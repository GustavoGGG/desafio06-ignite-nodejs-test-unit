import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase"
import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository";
import { ICreateTransferDTO } from "./ICreateTransferDTO";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { Statement } from "../../../statements/entities/Statement";

interface ISut {
  createTransferUseCase: CreateTransferUseCase,
  usersRepository: IUsersRepository;
  statementRepository: IStatementsRepository
}

interface IFakeUser {
  name: string;
  email: string;
  password: string;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}
const makeSut = (): ISut => {

  const usersRepository = new InMemoryUsersRepository()
  const statementRepository = new InMemoryStatementsRepository()
  const createTransferUseCase = new CreateTransferUseCase(usersRepository, statementRepository)
  return {
    createTransferUseCase,
    usersRepository,
    statementRepository
  }
}
const makeFakeCreateTransfer = (): ICreateTransferDTO => {
  return {
    amount: 40,
    sender_id: 'any_sender_id',
    user_id: 'any_user_id',
    description: 'any_description'
  }
}

const makeFakeUser = (): IFakeUser => {
  return {
    name: "any_name",
    email: "any_email",
    password: "any_password",
  }
}

const makeFakeOtherUser = (): IFakeUser => {
  return {
    name: "other_name",
    email: "other_email",
    password: "other_password",
  }
}

const makeFakeStatementDeposit = (): ICreateStatementDTO => {
  return {
    user_id: "any_user_id",
    description: "any_description",
    amount: 100,
    type: OperationType.DEPOSIT
  }
}
describe('Create Transfer', () => {
  test('should not be able to create transfer nonexistent user', async () => {
    const { createTransferUseCase } = makeSut()
    const transfer = createTransferUseCase.execute(makeFakeCreateTransfer())
    expect(transfer).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  test('should not be able to create transfer user insufficient funds', async () => {
    const { createTransferUseCase, usersRepository } = makeSut();
    const user = await usersRepository.create(makeFakeUser())
    const otherUser = await usersRepository.create(makeFakeOtherUser())
    const createTransfer = makeFakeCreateTransfer();
    createTransfer.user_id = user.id;
    createTransfer.sender_id = otherUser.id;
    const transfer = createTransferUseCase.execute(createTransfer)
    expect(transfer).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  test('should be able to create transfer user', async () => {
    const { createTransferUseCase, usersRepository, statementRepository } = makeSut();
    const user = await usersRepository.create(makeFakeUser())
    const createStatementDeposit = makeFakeStatementDeposit();
    createStatementDeposit.user_id = user.id;
    await statementRepository.create(createStatementDeposit)

    const otherUser = await usersRepository.create(makeFakeOtherUser())
    const createTransfer = makeFakeCreateTransfer();
    createTransfer.user_id = otherUser.id;;
    createTransfer.sender_id = user.id;
    const transfer = await createTransferUseCase.execute(createTransfer)

    expect(transfer).toBeInstanceOf(Statement)
    expect(transfer).toHaveProperty('id')
  })
})

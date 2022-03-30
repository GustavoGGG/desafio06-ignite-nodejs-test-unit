import { Statement } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateStatementDTO } from "./ICreateStatementDTO";

interface ISut {
  createStatementUseCase: CreateStatementUseCase;
  createUserUseCase: CreateUserUseCase;
}
interface IFakeUser {
  name: string;
  email: string;
  password: string;
}
enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}
const makeSut = (): ISut => {
  const usersRepository = new InMemoryUsersRepository()
  const createUserUseCase = new CreateUserUseCase(usersRepository);
  const statementRepository = new InMemoryStatementsRepository()
  const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementRepository)

  return {
    createStatementUseCase, createUserUseCase
  }
}
const makeFakeUser = (): IFakeUser => {
  return {
    name: "any_name",
    email: "any_email",
    password: "any_password",
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

const makeFakeStatementWithdraw = (): ICreateStatementDTO => {
  return {
    user_id: "any_user_id",
    description: "any_description",
    amount: 50,
    type: OperationType.WITHDRAW
  }
}
describe('Create Statement Deposit', () => {
  test('should not be able to create statement nonexistent user', () => {
    const { createStatementUseCase } = makeSut();
    const promise = createStatementUseCase.execute(makeFakeStatementDeposit())
    expect(promise).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  test('should be able to create statement deposit user', async () => {
    const { createStatementUseCase, createUserUseCase } = makeSut();
    const user = await createUserUseCase.execute(makeFakeUser())
    const createStatementDeposit = makeFakeStatementDeposit();
    createStatementDeposit.user_id = user.id;
    const statementDeposit = await createStatementUseCase.execute(createStatementDeposit)
    expect(statementDeposit).toBeInstanceOf(Statement)
    expect(statementDeposit).toHaveProperty('id')
  })

  test('should be able to create statement withdraw user', async () => {
    const { createStatementUseCase, createUserUseCase } = makeSut();
    const user = await createUserUseCase.execute(makeFakeUser())
    const createStatementDeposit = makeFakeStatementDeposit();
    createStatementDeposit.user_id = user.id;
    await createStatementUseCase.execute(createStatementDeposit)

    const createStatementWithdraw = makeFakeStatementWithdraw();
    createStatementWithdraw.user_id = user.id;
    const statementWithdraw = await createStatementUseCase.execute(createStatementWithdraw)
    expect(statementWithdraw).toBeInstanceOf(Statement)
    expect(statementWithdraw).toHaveProperty('id')
  })
  test('should not be able to create statement withdraw user insufficient funds', async () => {
    const { createStatementUseCase, createUserUseCase } = makeSut();
    const user = await createUserUseCase.execute(makeFakeUser())
    const createStatementDeposit = makeFakeStatementDeposit();
    createStatementDeposit.user_id = user.id;
    await createStatementUseCase.execute(createStatementDeposit)

    const createStatementWithdraw = makeFakeStatementWithdraw();
    createStatementWithdraw.user_id = user.id;
    createStatementWithdraw.amount = 150;
    const promise = createStatementUseCase.execute(createStatementWithdraw)
    expect(promise).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})

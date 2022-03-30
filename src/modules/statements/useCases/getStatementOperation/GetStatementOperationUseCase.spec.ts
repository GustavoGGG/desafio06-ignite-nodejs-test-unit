import { Statement } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { IGetStatementOperationDTO } from "./IGetStatementOperationDTO";

interface ISut {
  createStatementUseCase: CreateStatementUseCase;
  createUserUseCase: CreateUserUseCase
  getStatementOperationUseCase: GetStatementOperationUseCase

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
  const createUserUseCase = new CreateUserUseCase(usersRepository)
  const statementsRepository = new InMemoryStatementsRepository()
  const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
  const getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  return { createStatementUseCase, createUserUseCase, getStatementOperationUseCase }
}

const makeFakeGetStatement = (): IGetStatementOperationDTO => {
  return {
    user_id: 'any_user_id',
    statement_id: "any_id_statement"
  }
}

const makeFakeUser = (): IFakeUser => {
  return {
    name: "any_name",
    email: "any_email",
    password: "any_password",
  }
}

const makeFakeCreateStatement = (): ICreateStatementDTO => {
  return {
    user_id: "any_user_id",
    description: "any_description",
    amount: 100,
    type: OperationType.DEPOSIT
  }
}

describe('List Statement Operation', () => {
  test('should not be able to list Statement an nonexistent user', async () => {
    const { getStatementOperationUseCase } = makeSut();
    const promise = getStatementOperationUseCase.execute(makeFakeGetStatement())
    expect(promise).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)

  })
  test('should not be able to list statement', async () => {
    const { getStatementOperationUseCase, createUserUseCase } = makeSut();
    const user = await createUserUseCase.execute(makeFakeUser())
    const statement = makeFakeGetStatement();
    statement.user_id = user.id
    const promise = getStatementOperationUseCase.execute(statement)
    expect(promise).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
  test('should  be able to list statement', async () => {
    const { getStatementOperationUseCase, createUserUseCase, createStatementUseCase } = makeSut();
    const user = await createUserUseCase.execute(makeFakeUser())
    const statement = makeFakeCreateStatement()
    statement.user_id = user.id
    const createStatement = await createStatementUseCase.execute(statement)
    const getStatement = makeFakeGetStatement();
    getStatement.user_id = createStatement.user_id
    getStatement.statement_id = createStatement.id
    const response = await getStatementOperationUseCase.execute(getStatement)
    expect(response).toBeInstanceOf(Statement)
  })
})

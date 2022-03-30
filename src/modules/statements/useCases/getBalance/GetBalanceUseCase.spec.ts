import { InMemoryStatementsRepository } from '@modules/statements/repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '@modules/users/useCases/createUser/CreateUserUseCase';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase'

interface ISut {
  balanceUseCase: GetBalanceUseCase;
  userUseCase: CreateUserUseCase
}
interface IFakeUser {
  name: string;
  email: string;
  password: string;
}

const makeSut = (): ISut => {
  const usersRepository = new InMemoryUsersRepository()
  const statementsRepository = new InMemoryStatementsRepository()
  const balanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  const userUseCase = new CreateUserUseCase(usersRepository)
  return { balanceUseCase, userUseCase }
}

const makeFakeUser = (): IFakeUser => {
  return {
    name: "any_name",
    email: "any_email",
    password: "any_password",
  }
}
describe('Get Balance', () => {
  test('should not be able to list balance an nonexistent user', async () => {
    const { balanceUseCase } = makeSut();
    const user_id = 'any_id';
    const promise = balanceUseCase.execute({ user_id })
    expect(promise).rejects.toBeInstanceOf(GetBalanceError)

  })
  test('should be able to list balance user', async () => {
    const { balanceUseCase, userUseCase } = makeSut();
    const user = await userUseCase.execute(makeFakeUser())
    const balance = await balanceUseCase.execute({ user_id: user.id })
    expect(balance).toHaveProperty('balance')
    expect(balance).toHaveProperty('statement')
  })
})

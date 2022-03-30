import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

interface ISut {
  authenticateUserUseCase: AuthenticateUserUseCase;
  createUserUseCase: CreateUserUseCase
}
interface IUserAuthenticate {
  email: string;
  password: string;
}

interface IFakeUser {
  name: string;
  email: string;
  password: string;
}
const makeFakeUser = (): IFakeUser => {
  return {
    name: "any_name",
    email: "any_email",
    password: "any_password",
  }
}

const makeSut = (): ISut => {
  const usersRepository = new InMemoryUsersRepository()
  const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  const createUserUseCase = new CreateUserUseCase(usersRepository)
  return { authenticateUserUseCase, createUserUseCase }
}

const makeFakeUserAuthenticate = (): IUserAuthenticate => {
  return { email: "any_email", password: "any_password" }
}
describe('Authenticate User', () => {
  test('should be able to authenticate an user', async () => {
    const { authenticateUserUseCase, createUserUseCase } = makeSut();
    const userCreate = await createUserUseCase.execute(makeFakeUser())
    const response = await authenticateUserUseCase.execute(makeFakeUserAuthenticate());
    expect(response).toHaveProperty('token')

  })
  test('should not be able to authenticate an nonexistent user', async () => {
    const { authenticateUserUseCase } = makeSut();
    const promise = authenticateUserUseCase.execute(makeFakeUserAuthenticate());
    expect(promise).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  test('should not be able to authenticate with incorrect password', async () => {
    const { authenticateUserUseCase, createUserUseCase } = makeSut();
    await createUserUseCase.execute(makeFakeUser())
    const userAuthenticate = makeFakeUserAuthenticate();
    userAuthenticate.password = 'fake_password';
    const promise = authenticateUserUseCase.execute(userAuthenticate);
    expect(promise).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})

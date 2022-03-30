import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

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

interface ISut {
  usersRepository: IUsersRepository;
  createUserUseCase: CreateUserUseCase;
}

const makeSut = (): ISut => {
  const usersRepository = new InMemoryUsersRepository();
  const createUserUseCase = new CreateUserUseCase(usersRepository);
  return { usersRepository, createUserUseCase }
}

describe('Create User', () => {

  test('should be able a create new User', async () => {
    const { createUserUseCase } = makeSut()
    const user = await createUserUseCase.execute(makeFakeUser())
    expect(user).toHaveProperty("id")
    expect(user).toHaveProperty("password")
    expect(user.name).toEqual("any_name")
    expect(user.email).toEqual("any_email")
    expect(user).toBeInstanceOf(User)
  })

  test('should be able a create new User with email exists', async () => {
    const { createUserUseCase } = makeSut()
    await createUserUseCase.execute(makeFakeUser())
    const promise = createUserUseCase.execute(makeFakeUser())
    expect(promise).rejects.toBeInstanceOf(CreateUserError)
  })
})

import { User } from "@modules/users/entities/User";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

interface ISut {
  showUserProfileUseCase: ShowUserProfileUseCase,
  createUserUseCase: CreateUserUseCase
}
interface IFakeUser {
  name: string;
  email: string;
  password: string;
}
const makeSut = (): ISut => {
  const usersRepository = new InMemoryUsersRepository()
  const showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  const createUserUseCase = new CreateUserUseCase(usersRepository)
  return { showUserProfileUseCase, createUserUseCase }
}
const makeFakeUser = (): IFakeUser => {
  return {
    name: "any_name",
    email: "any_email",
    password: "any_password",
  }
}
describe('Show user Profile', () => {
  test('should be able show user profile ', async () => {
    const { showUserProfileUseCase, createUserUseCase } = makeSut()
    const userCreate = await createUserUseCase.execute(makeFakeUser())
    const response = await showUserProfileUseCase.execute(userCreate.id)
    expect(response).toBeInstanceOf(User)
  })
  test('should not be able to show user profile an nonexistent ', async () => {
    const { showUserProfileUseCase } = makeSut()
    const userId = 'any_id'
    const promise = showUserProfileUseCase.execute(userId)
    expect(promise).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})

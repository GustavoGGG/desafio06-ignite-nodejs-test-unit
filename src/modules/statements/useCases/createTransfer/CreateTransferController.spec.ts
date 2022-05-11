import request from 'supertest'

import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO'
import { UsersRepository } from '@modules/users/repositories/UsersRepository'


let connection: Connection

interface IRequest {
  amount: number;
  description: string;
}

interface IUserAuthenticate {
  email: string;
  password: string;
}

const makeFakeUser = (): ICreateUserDTO => {
  return {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
}

const makeFakeTransfer = (): IRequest => {
  return {
    amount: 40,
    description: 'any_description'
  }
}
const createUser = async () => {
  await request(app).post('/api/v1/users')
    .send(makeFakeUser());
}

const createOtherUser = async () => {
  await request(app).post('/api/v1/users')
    .send(makeFakeOtherUser());

}

const makeFakeOtherUser = (): ICreateUserDTO => {
  return {
    name: "other_name",
    email: "other_email",
    password: "other_password",
  }
}

const makeFakeUserAuthenticate = (): IUserAuthenticate => {
  return {
    email: "any_email@mail.com",
    password: "any_password"
  }
}
const createAuthenticateUser = async (): Promise<string> => {
  const responseToken = await request(app).post('/api/v1/sessions')
    .send(makeFakeUserAuthenticate());
  const { token } = responseToken.body
  return token
}

const makeFakeStatementDeposit = (): IRequest => {
  return {
    description: "any_description",
    amount: 100,

  }
}

describe('Create Transfer Controller', () => {

  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
    await createUser()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })
  test('should not be able to create transfer with a wrong token', async () => {
    const token = 'wrong_token'
    const response = await request(app).post('/api/v1/statements/transfer')
      .send(makeFakeTransfer())
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(401)
  })
  test('should not be able to create transfer user not exist', async () => {
    const token = await createAuthenticateUser()
    const user_id = 'wrong_user_id'
    const response = await request(app).post(`/api/v1/statements/transfer/${user_id}`)
      .send(makeFakeTransfer())
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(404)
  })

  test('should be able to create transfer ', async () => {
    const token = await createAuthenticateUser()
    await createOtherUser();

    const usersRepository = new UsersRepository()
    const { email } = makeFakeOtherUser()
    const user = await usersRepository.findByEmail(email);

    await request(app).post('/api/v1/statements/deposit')
      .send(makeFakeStatementDeposit())
      .set({
        'Authorization': `Bearer ${token}`
      })

    const response = await request(app).post(`/api/v1/statements/transfers/${user.id}`)
      .send(makeFakeTransfer())
      .set({
        'Authorization': `Bearer ${token}`
      })

    expect(response.status).toBe(201)
  })
})

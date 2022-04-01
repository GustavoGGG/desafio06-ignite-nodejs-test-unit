import request from 'supertest'

import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO'


interface IUserAuthenticate {
  email: string;
  password: string;
}

interface ICreateStatement {
  description: string;
  amount: number;
}

const makeFakeStatementDeposit = (): ICreateStatement => {
  return {
    description: "any_description",
    amount: 100,

  }
}

const makeFakeStatementWithdraw = (): ICreateStatement => {
  return {
    description: "any_description",
    amount: 50,
  }
}

const makeFakeUser = (): ICreateUserDTO => {
  return {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
}

const makeFakeUserAuthenticate = (): IUserAuthenticate => {
  return {
    email: "any_email@mail.com",
    password: "any_password"
  }
}

const createUser = async () => {
  await request(app).post('/api/v1/users')
    .send(makeFakeUser());
}

const createAuthenticateUser = async (): Promise<string> => {
  const responseToken = await request(app).post('/api/v1/sessions')
    .send(makeFakeUserAuthenticate());
  const { token } = responseToken.body
  return token
}
let connection: Connection
describe('Create Statement', () => {
  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
    await createUser()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  test('should not be able to create statement Deposit with a wrong token', async () => {
    const token = 'wrong_token'
    const response = await request(app).post('/api/v1/statements/deposit')
      .send(makeFakeStatementDeposit())
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(401)
  })

  test('should be able to create statement Deposit', async () => {
    const token = await createAuthenticateUser()
    const response = await request(app).post('/api/v1/statements/deposit')
      .send(makeFakeStatementDeposit())
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(201)
  })

  test('should not be able to create statement withdraw with a wrong token', async () => {
    const token = 'wrong_token'
    const response = await request(app).post('/api/v1/statements/withdraw')
      .send(makeFakeStatementWithdraw())
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(401)
  })

  test('should be able to create statement withdraw', async () => {
    const token = await createAuthenticateUser()
    const response = await request(app).post('/api/v1/statements/withdraw')
      .send(makeFakeStatementWithdraw())
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(201)
  })

  test('should not be able to create statement withdraw user insufficient funds', async () => {
    const token = await createAuthenticateUser()
    const fakeStatementWithdraw = makeFakeStatementWithdraw();
    fakeStatementWithdraw.amount = 300
    const response = await request(app).post('/api/v1/statements/withdraw')
      .send(fakeStatementWithdraw)
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(400)
    expect(response.body.message).toEqual('Insufficient funds')
  })
})

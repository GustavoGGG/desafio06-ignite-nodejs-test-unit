import request from 'supertest'

import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO'
import { v4 } from 'uuid';

let connection: Connection

interface IUserAuthenticate {
  email: string;
  password: string;
}
interface ICreateStatement {
  description: string;
  amount: number;
}

const makeFakeUser = (): ICreateUserDTO => {
  return {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
}
const createUser = async () => {
  await request(app).post('/api/v1/users')
    .send(makeFakeUser());
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
const makeFakeStatementDeposit = (): ICreateStatement => {
  return {
    description: "any_description",
    amount: 100,

  }
}
describe('Statement Operation', () => {
  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
    await createUser()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  test('should not be able to list Statement with a wrong token', async () => {
    const token = 'wrong_token'
    const response = await request(app).get('/api/v1/statements/')
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(401)
  })

  test('should not be able to list statement', async () => {
    const token = await createAuthenticateUser()
    const id = v4()
    const response = await request(app).get("/api/v1/statements/" + id)
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(404)
  })

  test('should  be able to list statement', async () => {
    const token = await createAuthenticateUser()
    const statementDeposit = await request(app).post('/api/v1/statements/deposit')
      .send(makeFakeStatementDeposit())
      .set({
        'Authorization': `Bearer ${token}`
      })
    const { id } = statementDeposit.body
    const response = await request(app).get("/api/v1/statements/" + id)
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
  })
})

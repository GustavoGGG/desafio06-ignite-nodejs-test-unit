import request from 'supertest'

import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO'


let connection: Connection

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

describe('Get Balance', () => {
  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  test('should not be able to list balance user with a wrong token', async () => {
    const token = 'wrong_token'
    const response = await request(app).get('/api/v1/statements/balance')
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(401)

  })
  test('should be able to list balance user', async () => {
    await createUser()
    const token = await createAuthenticateUser()
    const response = await request(app).get('/api/v1/statements/balance')
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('balance')
    expect(response.body).toHaveProperty('statement')
  })
})

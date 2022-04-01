import request from 'supertest'

import { app } from '../../../../app'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'
import { ICreateUserDTO } from '../createUser/ICreateUserDTO'

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
  return { email: "any_email@mail.com", password: "any_password" }
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

describe('Show user Profile', () => {
  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })
  test('should be able show user profile', async () => {
    await createUser()
    const token = await createAuthenticateUser()
    const response = await request(app).get('/api/v1/profile')
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('email')
    expect(response.body).toHaveProperty('created_at')
    expect(response.body).toHaveProperty('updated_at')
  })
  test('should not be able to show user profile with a wrong token', async () => {
    const token = 'wrong_token'
    const response = await request(app).get('/api/v1/profile')
      .set({
        'Authorization': `Bearer ${token}`
      })
    expect(response.status).toBe(401)
  })
})

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

describe('Authenticate User', () => {
  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })
  test('should be able to authenticate an user', async () => {
    await request(app).post('/api/v1/users')
      .send(makeFakeUser());
    const response = await request(app).post('/api/v1/sessions')
      .send(makeFakeUserAuthenticate());
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('token')
  })
  test('should not be able to authenticate an nonexistent user', async () => {
    const userAuthenticate = makeFakeUserAuthenticate()
    userAuthenticate.email = 'fake@mail.com'
    const response = await request(app).post('/api/v1/sessions')
      .send(userAuthenticate);
    expect(response.status).toBe(401)
    expect(response.body.message).toEqual('Incorrect email or password')

  })

  test('should not be able to authenticate with incorrect password', async () => {
    await request(app).post('/api/v1/users')
      .send(makeFakeUser());
    const userAuthenticate = makeFakeUserAuthenticate()
    userAuthenticate.password = 'fake_password'
    const response = await request(app).post('/api/v1/sessions')
      .send(userAuthenticate);
    expect(response.status).toBe(401)
    expect(response.body.message).toEqual('Incorrect email or password')
  })

})

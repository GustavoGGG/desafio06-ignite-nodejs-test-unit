import request from 'supertest'

import { app } from '../../../../app'
import { ICreateUserDTO } from './ICreateUserDTO'

import createConnection from '../../../../database'
import { Connection } from 'typeorm'

let connection: Connection
const makeFakeUser = (): ICreateUserDTO => {
  return {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
}
describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection('localhost')
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  test('should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users')
      .send(makeFakeUser());
    expect(response.status).toBe(201)
  })
  test('should not be able a create new User with email exists', async () => {
    await request(app).post('/api/v1/users')
      .send(makeFakeUser());
    const response = await request(app).post('/api/v1/users')
      .send(makeFakeUser());

    expect(response.status).toBe(400)
    expect(response.body.message).toEqual('User already exists')

  })
})

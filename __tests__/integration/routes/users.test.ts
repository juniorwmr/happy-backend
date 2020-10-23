import { createTypeOrmConnection } from '../../../src/database/connection';
import request from 'supertest';
import { app } from '../../../src/app';

beforeAll(async () => {
  await createTypeOrmConnection();
});

describe('Authentication', () => {
  it("shouldn't authenticate", async () => {
    const response = await request(app).post('/users/auth').send({
      email: 'juniorripardo@gmail.com',
      password: 'junior123',
    });
    expect(response.status).toBe(401);
    expect(response.body.auth).toBe(false);
  });

  it('should create a user', async () => {
    const response = await request(app).post('/users').send({
      name: 'Washington',
      email: 'juniorripardo@gmail.com',
      password: 'junior123',
    });
    expect(response.status).toBe(201);
  });

  it("shouldn't create a duplicate user (e-mail is unique)", async () => {
    const response = await request(app).post('/users').send({
      name: 'Junior Ripardo',
      email: 'juniorripardo@gmail.com',
      password: '123456',
    });
    expect(response.status).toBe(400);
  });

  it('should authenticate with valid credentials', async () => {
    const response = await request(app).post('/users/auth').send({
      email: 'juniorripardo@gmail.com',
      password: 'junior123',
    });
    expect(response.status).toBe(200);
    expect(response.body.auth).toBe(true);
  });

  it("shouldn't authenticate with invalid credentials", async () => {
    const response = await request(app).post('/users/auth').send({
      email: 'juniorripardo@gmail.com',
      password: '123456',
    });
    expect(response.status).toBe(401);
    expect(response.body.auth).toBe(false);
  });
});

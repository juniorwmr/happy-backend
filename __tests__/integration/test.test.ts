import { createTypeOrmConnection } from './../../src/database/connection';
import request from 'supertest';
import { app } from '../../src/app';

beforeAll(async () => {
  await createTypeOrmConnection();
});
describe(' FIRST OPERATIONS ', () => {
  it('this should be working', async () => {
    const response = await request(app).get('/orphanages');
    expect(response.status).toBe(200);
  });
});

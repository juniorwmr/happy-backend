import { createTypeOrmConnection } from '../../../src/database/connection';
import request from 'supertest';
import { app } from '../../../src/app';

beforeAll(async () => {
  await createTypeOrmConnection();
});
describe('AUTHENTICATION', () => {
  it('route (get) /orphanage should be working', async () => {
    const response = await request(app).get('/orphanages');
    expect(response.status).toBe(200);
  });

  it('should create a orphanage', async () => {
    const filePath = `${__dirname}/../testFiles/rifa.png`;
    const data = {
      name: 'Orfanato do Placas',
      latitude: -9.9470184,
      longitude: -67.8135286,
      about: 'Somos um orfanato com muitas crianças.',
      instructions: 'Não esquecer de levar algum documento com foto.',
      opening_hours: 'das 8h às 17h',
      open_on_weekends: true,
    };
    const response = await request(app)
      .post('/orphanages')
      .set('Accept', 'application/json')
      .field('name', data.name)
      .field('latitude', data.latitude)
      .field('longitude', data.longitude)
      .field('about', data.about)
      .field('instructions', data.instructions)
      .field('opening_hours', data.opening_hours)
      .field('open_on_weekends', data.open_on_weekends)
      .attach('images', filePath);

    expect(response.status).toBe(201);
  });
});

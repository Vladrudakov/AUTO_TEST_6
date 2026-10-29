const request = require('supertest');
const app = require('../src/app');

describe('Частина 1. Приклади з теоретичних відомостей (Dog API та Express)', () => {
  describe('Спосіб 1: Зовнішній API — Dog API (https://dog.ceo/api)', () => {
    const DOG_API_URL = 'https://dog.ceo/api';

    test('GET /breeds/image/random — використання методу .end() із функцією зворотного виклику', (done) => {
      request(DOG_API_URL)
        .get('/breeds/image/random')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('status', 'success');
          expect(res.body).toHaveProperty('message');
          expect(typeof res.body.message).toBe('string');
          expect(res.body.message).toMatch(/^https:\/\/images\.dog\.ceo\/breeds\//);
          done();
        });
    });

    test('GET /breeds/list/all — отримання списку всіх порід собак (async/await)', async () => {
      const response = await request(DOG_API_URL)
        .get('/breeds/list/all')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(typeof response.body.message).toBe('object');
    });
  });

  describe('Спосіб 2: Внутрішній API на базі Express (передача об’єкта app)', () => {
    test('GET /breeds/image/random — тестування локальної кінцевої точки Express через .end()', (done) => {
      request(app)
        .get('/breeds/image/random')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toEqual({
            message: 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg',
            status: 'success',
          });
          done();
        });
    });
  });
});

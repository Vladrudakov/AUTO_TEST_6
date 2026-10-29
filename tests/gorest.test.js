require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');

const GOREST_PUBLIC_URL = process.env.GOREST_BASE_URL || 'https://gorest.co.in/public/v2';
const GOREST_TOKEN = (process.env.GOREST_TOKEN || '').trim();

const crudTarget = GOREST_TOKEN ? 'https://gorest.co.in' : app;
const authToken = GOREST_TOKEN || 'demo-local-bearer-token';

describe('Частина 2. Завдання для самостійної роботи — Тестування GoRest API (https://gorest.co.in/)', () => {
  describe('1. Огляд ресурсів та метод GET на живому сервері https://gorest.co.in/public/v2', () => {
    let existingUserId;

    test('GET /users — отримання списку користувачів (код 200 та масив об’єктів)', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .get('/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const firstUser = res.body[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('name');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('gender');
      expect(firstUser).toHaveProperty('status');

      existingUserId = firstUser.id;
    });

    test('GET /users?gender=male&status=active&per_page=5 — фільтрація та пагінація', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .get('/users')
        .query({ gender: 'male', status: 'active', per_page: 5 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(5);
      res.body.forEach((user) => {
        expect(user.gender).toBe('male');
        expect(user.status).toBe('active');
      });
    });

    test('GET /users/:id — отримання конкретного користувача за його ID', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .get(`/users/${existingUserId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.id).toBe(existingUserId);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
    });

    test('GET /posts — отримання списку публікацій (ресурс Posts)', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .get('/posts')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('user_id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('body');
    });

    test('GET /comments — отримання списку коментарів (ресурс Comments)', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .get('/comments')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('post_id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('body');
    });

    test('GET /todos — отримання списку завдань (ресурс Todos)', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('user_id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('status');
    });

    test('GET /users/999999999 — повертає 404 Not Found для неіснуючого користувача', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .get('/users/999999999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(res.body).toHaveProperty('message', 'Resource not found');
    });

    test('POST /users без токена авторизації — повертає 401 Unauthorized на живому сервері', async () => {
      const res = await request(GOREST_PUBLIC_URL)
        .post('/users')
        .send({
          name: 'Unauthorized User',
          email: `unauth_${Date.now()}@example.com`,
          gender: 'male',
          status: 'active',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Authentication failed');
    });
  });

  describe('2. Тестування основних методів CRUD (POST, GET, PUT, PATCH, DELETE) для /public/v2/users', () => {
    let createdUserId;
    const uniqueEmail = `student.lab6.${Date.now()}@example.com`;

    test('POST /public/v2/users — створення нового користувача (201 Created)', async () => {
      const newUser = {
        name: 'Іван Франко',
        email: uniqueEmail,
        gender: 'male',
        status: 'active',
      };

      const res = await request(crudTarget)
        .post('/public/v2/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Accept', 'application/json')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newUser.name);
      expect(res.body.email).toBe(newUser.email);
      expect(res.body.gender).toBe(newUser.gender);
      expect(res.body.status).toBe(newUser.status);

      createdUserId = res.body.id;
    });

    test('GET /public/v2/users/:id — перевірка створеного користувача (200 OK)', async () => {
      const res = await request(crudTarget)
        .get(`/public/v2/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.id).toBe(createdUserId);
      expect(res.body.name).toBe('Іван Франко');
      expect(res.body.email).toBe(uniqueEmail);
    });

    test('PUT /public/v2/users/:id — повне оновлення даних користувача (200 OK)', async () => {
      const updatedUser = {
        name: 'Іван Франко (Оновлено)',
        email: `updated.${uniqueEmail}`,
        gender: 'male',
        status: 'inactive',
      };

      const res = await request(crudTarget)
        .put(`/public/v2/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedUser)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.id).toBe(createdUserId);
      expect(res.body.name).toBe(updatedUser.name);
      expect(res.body.email).toBe(updatedUser.email);
      expect(res.body.status).toBe('inactive');
    });

    test('PATCH /public/v2/users/:id — часткове оновлення статусу користувача (200 OK)', async () => {
      const res = await request(crudTarget)
        .patch(`/public/v2/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'active' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.id).toBe(createdUserId);
      expect(res.body.status).toBe('active');
    });

    test('POST /public/v2/users — помилка валідації при порожніх обов’язкових полях (422 Unprocessable Entity)', async () => {
      const res = await request(crudTarget)
        .post('/public/v2/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' })
        .expect('Content-Type', /json/)
        .expect(422);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('field');
      expect(res.body[0]).toHaveProperty('message');
    });

    test('DELETE /public/v2/users/:id — видалення користувача (204 No Content)', async () => {
      await request(crudTarget)
        .delete(`/public/v2/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    test('GET /public/v2/users/:id — перевірка, що після видалення повертається 404 Not Found', async () => {
      const res = await request(crudTarget)
        .get(`/public/v2/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(res.body).toHaveProperty('message', 'Resource not found');
    });
  });
});

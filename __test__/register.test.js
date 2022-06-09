const request = require('supertest');
const app = require('../app');
const { User } = require('../app/models');

describe('POST /v1/auth/register', () => {
  const user201 = {
    name: 'Kim Namjoon',
    email: 'rkive@gmail.com',
    password: 'namjoonarchive',
  };
  const user422 = {
    name: 'Kim Seokjin',
    email: 'seokjin@gmail.com',
    password: 'eatjin',
    role: 2,
  };
  beforeEach(async () => {
    await User.create(user422);
  });
  afterEach(async () => {
    await User.destroy({
      where: {
        email: user201.email,
      },
    });
    await User.destroy({
      where: {
        email: user422.email,
      },
    });
  });

  it('should response with 201 as status code (Success Register)', async () => request(app)
      .post('/v1/auth/register')
      .set('Content-Type', 'application/json')
      .send(user201)
      .then((res) => {
        expect(res.statusCode).toBe(201);
        expect(res.body.accesToken).toEqual(res.body.accesToken);
      }));
  it('should response with 422 as status code (Email Already Taken)', async () => request(app)
      .post('/v1/auth/register')
      .set('Content-Type', 'application/json')
      .send(user422)
      .then((res) => {
        expect(res.statusCode).toBe(422);
        expect(res.body.error.details.email.toLowerCase()).toEqual(
          user422.email.toLowerCase(),
        );
      }));
});

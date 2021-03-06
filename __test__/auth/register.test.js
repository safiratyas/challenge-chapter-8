const request = require('supertest');
const app = require('../../app');
const { User } = require('../../app/models');

const userOne = {
  name: 'Kim Namjoon',
  email: 'rkive@gmail.com',
  password: 'namjoonarchive',
};

const userTwo = {
  name: 'Kim Seokjin',
  email: 'seokjin@gmail.com',
  password: 'eatjin',
  role: 2,
};

beforeEach(async () => {
  await User.create(userTwo);
});

afterEach(async () => {
  await User.destroy({
    where: {
      email: userOne.email,
    },
  });
  await User.destroy({
    where: {
      email: userTwo.email,
    },
  });
});

describe('POST /v1/auth/register', () => {
  it('should response with 201 as status code which means user successfully registered', async () => request(app)
    .post('/v1/auth/register')
    .set('Content-Type', 'application/json')
    .send(userOne)
    .then((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body.accesToken).toEqual(res.body.accesToken);
    }));

    it('should response with 422 as status code which means email already registered befoe', async () => request(app)
    .post('/v1/auth/register')
    .set('Content-Type', 'application/json')
    .send(userTwo)
    .then((res) => {
      expect(res.statusCode).toBe(422);
      expect(res.body.error.details.email.toLowerCase()).toEqual(
        userTwo.email.toLowerCase(),
      );
    }));

    it('should response with 500 as status code which means nothing is send', async () => request(app)
    .post('/v1/auth/register')
    .set('Content-Type', 'application/json')
    .send({

    })
    .then((res) => {
      expect(res.statusCode).toBe(500);
      expect(res.body.error.message).toEqual("Cannot read properties of undefined (reading 'toLowerCase')");
    }));
});

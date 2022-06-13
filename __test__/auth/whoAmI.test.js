const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const { User } = require('../../app/models');

const userPassword = 'springday';

const validUser = {
  name: 'Taehyung',
  email: 'customer@binar.com',
  encryptedPassword: bcrypt.hashSync(userPassword, 10),
  roleId: 1,
};

const invalidUser = {
  name: 'Safira',
  email: 'admin@binar.com',
  encryptedPassword: bcrypt.hashSync(userPassword, 10),
  roleId: 2,
};

describe('GET /v1/auth/whoami', () => {
  beforeAll(async () => {
    try {
      await User.create(invalidUser);
      await User.create(validUser);
    } catch (err) {
      console.error(err.message);
    }
  });

  afterAll(async () => {
    try {
      await User.destroy({
        where: {
          email: invalidUser.email,
        },
      });
      await User.destroy({
        where: {
          email: validUser.email,
        },
      });
    } catch (err) {
      console.error(err.message);
    }
  });

  describe('Mission Successfull', () => {
    let token;
    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: validUser.email,
          password: userPassword,
        })
        .then((validRoleUser) => {
          console.log(validRoleUser.body)
          token = validRoleUser.body.accessToken;
        });
    });

    it('should response with 200 as status code which means valid role (CUSTOMER)', async () => {
     await request(app)
        .get('/v1/auth/whoami')
        .set('Authorization', `Bearer ${token}`)
        .then((whichValidUser) => {
          console.log(whichValidUser.body)
          expect(whichValidUser.statusCode).toBe(200);
          expect(whichValidUser.body.name).toEqual(validUser.name);
          expect(whichValidUser.body.email).toEqual(validUser.email.toLowerCase());
        });
    });
  });

  describe('Mission Failed', () => {
    let token;
    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: invalidUser.email,
          password: userPassword,
        })
        .then((invalidRoleUser) => {
          token = invalidRoleUser.body.accessToken;
        });
    });

    it('should response with 401 as status code which means invalid role (ADMIN)', () => {
      request(app)
        .get('/v1/auth/whoami')
        .set('Authorization', `Bearer ${token}`)
        .then((whichInvalidUser) => {
          expect(whichInvalidUser.statusCode).toBe(401);
          expect(whichInvalidUser.body).toEqual({
            error: {
              name: 'Error',
              message: 'Access forbidden!',
              details: {
                role: 'ADMIN',
                reason: 'ADMIN is not allowed to perform this operation.',
              },
            },
          });
        });
    });
  });
});

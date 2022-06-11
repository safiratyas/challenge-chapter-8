const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const { User } = require('../../app/models');

describe('POST /v1/auth/login', () => {
  const loginEmail = 'hellosafira@gmail.com';
  const emailNotRegistered = 'byesafira@gmail.com';
  const password = 'safiratyas';
  const wrongPassword = 'safira123';
  const passwordBcrypt = bcrypt.hashSync(password, 10);

  const userLogin = {
    name: 'Safira',
    email: loginEmail,
    encryptedPassword: passwordBcrypt,
    roleId: 2,
  };

  beforeEach(async () => {
    await User.create(userLogin);
    const user = await User.findOne({ where: { email: emailNotRegistered } });
    if (user != null) {
      await User.destroy({
        where: {
          email: emailNotRegistered,
        },
      });
    }
  });

  afterEach(async () => {
    await User.destroy({
      where: {
        email: loginEmail,
      },
    });
  });

  it('should response with 200 as status code for user login', async () => request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: userLogin.email, password })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.accesToken).toEqual(res.body.accesToken);
      }));

  it('should response with 404 as status code because email is not registered', async () => request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: emailNotRegistered, password })
      .then((res) => {
        expect(res.statusCode).toBe(404);
        expect(res.body.error.details.email).toEqual(
          emailNotRegistered.toLowerCase(),
        );
      }));

      it('should response with 401 as status code because user input a wrong password', async () => request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: loginEmail, password: wrongPassword })
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body.error.details.message).toEqual(
          'Password is wrong',
        );
      }));
});

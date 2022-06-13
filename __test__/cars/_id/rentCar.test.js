const request = require('supertest');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const app = require('../../../app');
const { User, Car } = require('../../../app/models');

describe('POST /v1/cars/:id/rent', () => {
  const dataAdmin = {
    name: 'Safira',
    email: 'sattrnz@mail.com',
    encryptedPassword: bcrypt.hashSync('safira', 10),
    roleId: 2,
  };
  const Customer = {
    name: 'Taehyung',
    email: 'thv@mail.com',
    encryptedPassword: bcrypt.hashSync('taehyung', 10),
    roleId: 1,
  };
  const dataCar = {
    name: 'Hyundai',
    price: 500000,
    size: 'SMALL',
    image: 'https://source.unsplash.com/531x531',
    isCurrentlyRented: false,
  };

  let idCar;

  beforeAll(async () => {
    await User.create(dataAdmin);
    await User.create(Customer);
    const createCar = await Car.create(dataCar);
    idCar = createCar.id;
  });

  afterAll(async () => {
    // await User.destroy({
    //   where: {
    //     email: dataAdmin.email,
    //   },
    // });
    // await User.destroy({
    //   where: {
    //     email: Customer.email,
    //   },
    // });
  });

  describe('should response with 201 as status code', () => {
    let tokenCustomer;
    const rentData = {
      rentStartedAt: '2022-06-13T07:38:03.392Z',
      rentEndedAt: '2022-06-13T07:38:03.392Z',
    };
    beforeEach(async () => {
      await request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: Customer.email, password: 'taehyung' })
      .then((res) => {
        tokenCustomer = res.body.accessToken;
      });
    });
    it('should response with 201 which means rent car is success', async () => {
      await request(app)
      .post(`/v1/cars/${idCar}/rent`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send(rentData)
      .then((res) => {
        expect(res.statusCode).toBe(201);
        expect(res.body.rentStartedAt).toEqual(rentData.rentStartedAt);
        expect(res.body.rentEndedAt).toEqual(rentData.rentEndedAt);
      });
    });
  });

  describe('should response with 401 as status code', () => {
    let tokenAdmin;
    const rentData = {
      rentStartedAt: '2022-06-13T07:38:03.392Z',
      rentEndedAt: '2022-06-13T07:38:03.392Z',
    };
    beforeEach(async () => {
      await request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: dataAdmin.email, password: 'safira' })
      .then((res) => {
        tokenAdmin = res.body.accessToken;
      });
    });
    it('should response with 401 which means rent car is failed', async () => {
      await request(app)
      .post(`/v1/cars/${idCar}/rent`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(rentData)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual(
          {
            error: {
              name: 'Error',
              message: 'Access forbidden!',
              details: {
                role: 'ADMIN',
                reason: 'ADMIN is not allowed to perform this operation.',
              },
            },
          },
        );
      });
    });
  });

  describe('should response with 422 as status code', () => {
    let tokenCustomer;
    const rentData = {
      rentStartedAt: '2022-06-13T07:38:03.392Z',
      rentEndedAt: '2022-06-13T07:38:03.392Z',
    };
    beforeEach(async () => {
      await request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: Customer.email, password: 'taehyung' })
      .then((res) => {
        tokenCustomer = res.body.accessToken;
      });
    });
    it('should response with 422 which means rent car already rented', async () => {
      await request(app)
      .post(`/v1/cars/${idCar}/rent`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send(rentData)
      .then((res) => {
        expect(res.statusCode).toBe(422);
        expect(res.body.error.message).toEqual(`${dataCar.name} is already rented!!`);
      });
    });
  });
});

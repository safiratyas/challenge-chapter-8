const request = require('supertest');
const app = require('../../../app');
const { Car } = require('../../../app/models');

describe('Cars', () => {
  let car;
  let accessToken;
  beforeAll(async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'Fikri@binar.co.id',
        password: '123456',
      });
    accessToken = response.body.accessToken;
    car = await Car.create({
      name: 'Hyundai',
      price: 500000,
      size: 'SMALL',
      image: 'https://source.unsplash.com/531x531',
      isCurrentlyRented: false,
    });
    return car;
  });

  afterAll(() => car.destroy());

  it('should response with 201 as status code which means valid role (ADMIN) can update new car', () => request(app)
    .put(`/v1/cars/${car.id}`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name: 'Avanza',
      price: 400000,
      size: 'SMALL',
      image: 'https://source.unsplash.com/531x531',
    })
    .then((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: expect.any(String),
      });
    }));
});

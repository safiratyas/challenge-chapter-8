const request = require('supertest');
const app = require('../../app');

describe('GET /v1/cars', () => {
  it('should response with 200 as status code which means can show list of cars', () => {
    request(app)
      .get('/v1/cars')
      .set('Content-Type', 'application/json')
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.cars).toBeDefined();
        expect(res.body.meta.pagination).toEqual(
          expect.objectContaining({
            page: expect.any(Number),
            pageCount: expect.any(Number),
            pageSize: expect.any(Number),
            count: expect.any(Number),
          }),
        );
      });
  });
});

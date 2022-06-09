// const request = require('supertest');
// const app = require('../app');

// describe('POST /v1/auth/login', () => {
//   it('should response with 200 as status code', async () => {
//     const email = 'yoongi@gmail.com';
//     const password = 'safiratyas';

//     return request(app)
//       .post('/v1/auth/login')
//       .set('Content-Type', 'application/json')
//       .send({ email, password })
//       .then((res) => {
//         console.log(res);
//         expect(res.statusCode).toBe(200);
//         expect(res.body.accesToken).toEqual(res.body.accesToken);
//       });
//   });

  // it('should response with 404 as status code which means email is not registered', async () => {
  //   const email = 'yoongi@gmail.com';
  //   const password = 'safiratyas';

  //   return request(app)
  //     .post('/v1/auth/login')
  //     .set('Content-Type', 'application/json')
  //     .send({ email, password })
  //     .then((res) => {
  //       console.log(res);
  //       expect(res.statusCode).toBe(404);
  //       expect(res.body.email).toEqual(res.body.email);
  //     });
  // });

  // it('should response with 401 as status code which means password is wrong', async () => {
  //   const email = 'yoongi@gmail.com';
  //   const password = 'safiratyas';

  //   return request(app)
  //     .post('/v1/auth/login')
  //     .set('Content-Type', 'application/json')
  //     .send({ email, password })
  //     .then((res) => {
  //       console.log(res)
  //       expect(res.statusCode).toBe(401);
  //       expect(res.body.password).toBe('Wrong Password!');
  //     });
  // });
});

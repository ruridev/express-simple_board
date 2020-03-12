var request = require('supertest');
var app = require('../app');

describe('GET /', function() {
  it('/posts로 리다이렉트', function(done) {
    request(app)
      .get('/')
      .expect(302, done)
      .expect(function(res) {
        res.header.location = '/posts';
      });
  });
});

describe('GET /posts', function() {
  it('게시글 목록화면', function(done) {
    request(app)
      .get('/posts')
      .expect(200, done)
      .expect(function(res) {
        res.header.location = '/posts';
        res.body = {};
      });
  });
});

describe('POST /posts', function() {
  it('게시글 작성', function(done) {
    request(app)
      .post('/posts')
      .send('title=title')
      .send('body=body')
      .send('writer=writer')
      .send('password=password')
      .expect(302, done);
  });
});

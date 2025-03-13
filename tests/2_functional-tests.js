const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testBookId; // Store a valid book ID for later tests

  suite('POST /api/books with title => create book object/expect book object', function() {
    
    test('Test POST /api/books with title', function(done) {
      chai.request(server)
        .post('/api/books')
        .send({ title: 'Test Book' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id', 'Book should contain _id');
          assert.property(res.body, 'title', 'Book should contain title');
          assert.equal(res.body.title, 'Test Book');
          testBookId = res.body._id; // Save the ID for later tests
          done();
        });
    });
    
    test('Test POST /api/books with no title given', function(done) {
      chai.request(server)
        .post('/api/books')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required field title');
          done();
        });
    });
    
  });

  suite('GET /api/books => array of books', function(){
    
    test('Test GET /api/books', function(done){
      chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books should contain commentcount');
          assert.property(res.body[0], 'title', 'Books should contain title');
          assert.property(res.body[0], '_id', 'Books should contain _id');
          done();
        });
    });      
    
  });

  suite('GET /api/books/[id] => book object with [id]', function(){
    
    test('Test GET /api/books/[id] with id not in db', function(done){
      chai.request(server)
        .get('/api/books/invalidID123')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });
    
    test('Test GET /api/books/[id] with valid id in db', function(done){
      chai.request(server)
        .get('/api/books/' + testBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, '_id', 'Book should contain _id');
          assert.property(res.body, 'title', 'Book should contain title');
          assert.property(res.body, 'comments', 'Book should contain comments array');
          assert.isArray(res.body.comments, 'Comments should be an array');
          assert.equal(res.body._id, testBookId);
          done();
        });
    });
    
  });

  suite('POST /api/books/[id] => add comment/expect book object with id', function(){
    
    test('Test POST /api/books/[id] with comment', function(done){
      chai.request(server)
        .post('/api/books/' + testBookId)
        .send({ comment: 'This is a test comment' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, '_id', 'Book should contain _id');
          assert.property(res.body, 'title', 'Book should contain title');
          assert.property(res.body, 'comments', 'Book should contain comments array');
          assert.isArray(res.body.comments, 'Comments should be an array');
          assert.include(res.body.comments, 'This is a test comment');
          done();
        });
    });

    test('Test POST /api/books/[id] without comment field', function(done){
      chai.request(server)
        .post('/api/books/' + testBookId)
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required field comment');
          done();
        });
    });

    test('Test POST /api/books/[id] with comment, id not in db', function(done){
      chai.request(server)
        .post('/api/books/invalidID123')
        .send({ comment: 'Should not work' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });
    
  });

  suite('DELETE /api/books/[id] => delete book object id', function() {

    test('Test DELETE /api/books/[id] with valid id in db', function(done){
      chai.request(server)
        .delete('/api/books/' + testBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'delete successful');
          done();
        });
    });

    test('Test DELETE /api/books/[id] with id not in db', function(done){
      chai.request(server)
        .delete('/api/books/' + testBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

  });

});

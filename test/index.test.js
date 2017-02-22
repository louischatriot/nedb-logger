var should = require('chai').should()
  , assert = require('chai').assert
  , testDb = 'workspace/test.db'
  , fs = require('fs')
  , path = require('path')
  , Logger = require('../index')
  , Datastore = new require('nedb-core')
  , db
  ;
  
describe('NeDB Logger', function () {

  beforeEach(function() {
    if (fs.existsSync(testDb)) { fs.unlinkSync(testDb); }
    fs.existsSync(testDb).should.equal(false);
    db = null;
  });
  
  it("Inserting one document", function (done) {
    var logger = new Logger({ filename: testDb });
        
    logger.insert({ hello: "world" }, function (err) {
      assert.isNull(err);
      assert.isNotNull(fs.readFileSync(testDb, 'utf8').match(/^{"hello":"world","_id":"[a-zA-Z0-9]{16}"}\n$/));
      
      db = new Datastore({ filename: testDb, autoload: true });
      db.find({}, function (err, docs) {
        assert.isNull(err);
        docs.length.should.equal(1);
        docs[0].hello.should.equal("world");
        done();
      });      
    });
  });
  
  it("Inserting one document with an error", function (done) {
    var logger = new Logger({ filename: testDb });
        
    logger.insert({ "$hello": "world" }, function (err) {
      assert.isNotNull(err);
      fs.readFileSync(testDb, 'utf8').should.equal('');
      
      logger.insert({ "hello.world": "again" }, function (err) {
        assert.isNotNull(err);
        fs.readFileSync(testDb, 'utf8').should.equal('');
        
        db = new Datastore({ filename: testDb, autoload: true });
        db.find({}, function (err, docs) {
          assert.isNull(err);
          docs.length.should.equal(0);
          done();
        });      
      });
    });
  });  
  
  it("Inserting multiple documents in sequence", function (done) {
    var logger = new Logger({ filename: testDb });
        
    logger.insert({ hello: "world" }, function (err) {
      assert.isNull(err);
      assert.isNotNull(fs.readFileSync(testDb, 'utf8').match(/^{"hello":"world","_id":"[a-zA-Z0-9]{16}"}\n$/));

      logger.insert({ number: 42 }, function (err) {
        assert.isNull(err);
        assert.isNotNull(fs.readFileSync(testDb, 'utf8').match(/^{"hello":"world","_id":"[a-zA-Z0-9]{16}"}\n{"number":42,"_id":"[a-zA-Z0-9]{16}"}\n$/));
        
        db = new Datastore({ filename: testDb, autoload: true });
        db.find({}, function (err, docs) {
          assert.isNull(err);
          docs.length.should.equal(2);
          if (docs[0].hello === "world") {
            docs[0].hello.should.equal("world");          
            docs[1].number.should.equal(42);          
          } else {
            docs[1].hello.should.equal("world");          
            docs[0].number.should.equal(42);                    
          }
          done();
        });      
      });
    });
  });  
  
  it("Inserting multiple documents at once", function (done) {
    var logger = new Logger({ filename: testDb });

    logger.insert([{ hello: "world" }, { number: 42 }], function (err) {
      assert.isNull(err);
      assert.isNotNull(fs.readFileSync(testDb, 'utf8').match(/^{"hello":"world","_id":"[a-zA-Z0-9]{16}"}\n{"number":42,"_id":"[a-zA-Z0-9]{16}"}\n$/));
      
      db = new Datastore({ filename: testDb, autoload: true });
      db.find({}, function (err, docs) {
        assert.isNull(err);
        docs.length.should.equal(2);
        if (docs[0].hello === "world") {
          docs[0].hello.should.equal("world");          
          docs[1].number.should.equal(42);          
        } else {
          docs[1].hello.should.equal("world");          
          docs[0].number.should.equal(42);                    
        }
        done();
      });      
    });
  });    
  
  it("Inserting multiple documents at once with an error", function (done) {
    var logger = new Logger({ filename: testDb });

    logger.insert([{ hello: "world" }, { "$number": 42 }], function (err) {
      assert.isNotNull(err);
      fs.readFileSync(testDb, 'utf8').should.equal('');
      
      db = new Datastore({ filename: testDb, autoload: true });
      db.find({}, function (err, docs) {
        assert.isNull(err);
        docs.length.should.equal(0);
        done();
      });      
    });
  });

  it("Can insert without a callback", function (done) {
    var logger = new Logger({ filename: testDb });
        
    logger.insert({ hello: "world" });
    setTimeout(function () {
      assert.isNotNull(fs.readFileSync(testDb, 'utf8').match(/^{"hello":"world","_id":"[a-zA-Z0-9]{16}"}\n$/));
      
      db = new Datastore({ filename: testDb, autoload: true });
      db.find({}, function (err, docs) {
        assert.isNull(err);
        docs.length.should.equal(1);
        docs[0].hello.should.equal("world");
        done();
      });
    }, 100);
  });


});
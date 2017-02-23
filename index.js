var Persistence = require('nedb-core/lib/persistence')
  , model = require('nedb-core/lib/model')
  , customUtils = require('nedb-core/lib/custom-utils')
  , mkdirp = require('mkdirp')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  ;

function Logger (dbOptions) {  
  dbOptions.inMemoryOnly = false;
  dbOptions.autoload = false;
  this.persistence = new Persistence({ db: dbOptions });
  
  // Make sure file and containing directory exist, create them if they don't
  mkdirp.sync(path.dirname(dbOptions.filename));
  if (!fs.existsSync(dbOptions.filename)) { fs.writeFileSync(dbOptions.filename, '', 'utf8'); }
}

// docs can be one document or an array of documents
Logger.prototype.insert = function (_docs, cb) {
  var callback = cb || function () {}
    , docs = util.isArray(_docs) ? _docs : [_docs]
    , preparedDocs = []
    ;

  try {
    docs.forEach(function (doc) {
      preparedDocs.push(model.deepCopy(doc));
    });
    preparedDocs.forEach(function(doc) {
      doc._id = customUtils.uid(16);
      model.checkObject(doc);
    });
    this.persistence.persistNewState(preparedDocs, callback);
  } catch (err) {
    return callback(err);
  }
};



// Interface
module.exports = Logger;
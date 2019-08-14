// devices-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const devices = new Schema({
    AssigendToUsers: [{type: Schema.Types.ObjectId, ref: 'users'}],
    deviceToken: { type: String, index:{ unique: true, spare:	true} },
    gcmID : { type: String, index:{ unique: true, spare:	true} },
    geoInfo : [{
      logger: {type: Schema.Types.ObjectId, ref: 'users'},
      ip : { type: String, index:{ unique: true, spare:	true} }
    }]
  }, {
    timestamps: true
  });

  return mongooseClient.model('devices', devices);
};

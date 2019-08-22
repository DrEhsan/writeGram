module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');

  const { Schema } = mongooseClient;
  const customSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    requested: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    status: { type: String, default: 'Pending', index: true},
    dateSent: { type: Date, default: Date.now, index: true },
    dateAccepted: { type: Date, required: false, index: true }
  }, {
    timestamps: true,
    versionKey: false
  });


  return mongooseClient.model('custom', customSchema);
};
/* eslint-disable no-unused-vars */

class Service {
  constructor (options) {
    //console.log(options)
    this.model = options.Model;
    this.mongo = new options.mongoClass(options);
    this.options = options || {};
  }

  getfirendsRequests(params){
    return {
      aggregate : [
      {
        $match: { "requested" : params.user._id}
      }, {
        $lookup: {
          from: "users",
          localField: "requester",
          foreignField: "_id",
          as: "requester"
        }
      }, {
        $unwind: {
          path: "$requester",
          preserveNullAndEmptyArrays: true
        }
      },{
        $lookup: {
          from: "profiles",
          localField: "requester.profile",
          foreignField: "_id",
          as: "requester.profile",
        }
      },{
        $unwind: {
          path: "$requester.profile",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {"requester.userId": "$requester._id"},
        $addFields: {"requester.profile.profileId": "$requester.profile._id"},
      },
      {
        $project: {
          _id: 0,
          "requester._id": 0,
          "requester.email": 0,
          "requester.registerStatus": 0,
          "requester.apiKey": 0,
          "requester.password": 0,
          "requester.profile._id": 0,
          "requester.profile.__v": 0,
        }
      }]
    }
  }

  async find (params) {

    if (params.query.$getFriendRequests != undefined){
        params.query = this.getfirendsRequests(params);
    }


    return await this.mongo._find(params)
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }

  async create (data, params) {

    let  mainAccount  = params.user._id;
    let { requestedAccount } = data;

    let conditions = {
      requester: requestedAccount,
      requested: mainAccount
    }

    let find = await this.mongo.findOne(conditions);

    if (find == null){

      let populate =
      [
        { path : 'requester',  select: { '_id': 1, 'username':1 }, populate : { path : 'profile'}},
        { path : 'requested',  select: { '_id': 1, 'username':1 }, populate : { path : 'profile'}}
      ]

      let save = await this.mongo.saveAndPopulate(conditions, populate);
      return await this.successPacketBuilder(save);
    }

    let error = (find.status === 'Pending') ? 'RequestIsPending': 'RequestersAreFriend';

    return await this.errorPacketBuilder(error);
  }

  // ----------------- common packetBuilders

  async successPacketBuilder(items){
    return {
      status : true,
      payload: items
    }
  }

  async errorPacketBuilder(error){
    return {
      status : false,
      error: error
    }
  }
  //------------------




}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;

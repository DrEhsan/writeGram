class mongoClass{
  constructor(options){
    this.model = options.Model;
    this.lean = options.lean;
    this.conditions = {},
    this.sort = false;
    this.limit = false;
    this.skip = false;
    this.aggregate = {};
    this.populate = {};
    this.select = {};
  }

  async queryParser(params){

    this.query = params.query;

    this.aggregate = this.query.aggregate != undefined ? this.query.aggregate : false;


    this.conditions = this.query.conditions;

    this.populate = this.query.populate != undefined ? this.query.populate : false;

    this.select = this.query.select != undefined ? this.query.select : false;

    if (this.query.utils != undefined){
      this.limit = this.query.utils.limit != undefined ? this.query.utils.limit : false;
      this.sort = this.query.utils.sort != undefined ? this.query.utils.sort : false;
      this.skip = this.query.utils.skip != undefined ? this.query.utils.skip : false;
    }
  }

  async _find_with_aggregate(){
    return await this.model.aggregate([this.aggregate]).exec();
  }

  async _find(params){
    this.queryParser(params);

    if (this.aggregate){
      let res = await this._find_with_aggregate();

      return {
        total : res.length,
        result : res
      }
    }

    return await this.findSimple();
  }

  async findSimple (){

    const queryBuilder = this.model.find(this.conditions);


    return 'findSimple'



  }



  get Model () {
    return this.options.Model;
  }


  async findOne (conditions){
    return new Promise((resolve, reject) => {
      this.model.findOne(conditions).then(result => {
        resolve(result);
      }).catch(error =>{
        reject(error)
      })
    })
  }

  async saveAndPopulate (conditions, populate){
    return new Promise((resolve, reject) => {
      const savemodel = new this.model(conditions);
      savemodel.save(conditions).then(saved => {
        resolve(
                saved
                  .populate(populate)
                  .execPopulate()
                )
      }).catch(error =>{
        reject(error)
      })
    })
  }
}

module.exports = function (options) {
  return new mongoClass(options);
};

module.exports.mongoClass = mongoClass;
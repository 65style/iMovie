var mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
  doctor: String,
  title: String,
  language: String,
  country: String,
  summary: String,
  flash: String,
  poster: String,
  year: Number,
  meta: { // 跟新时的时间记录
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

MovieSchema.pre('save', function(next) {
  if (this.isNew) { // 判断数据是否是新加的
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

MovieSchema.statics = {
  fetch: function(cb) {
    return this
      .find({}) // 去除数据库所有数据
      .sort('meta.updatedAt') // 按照更新时间排序
      .exec(cb)
  },
  findById: function(id, cb) {
    return this
      .findOne({_id: id}) // 查询单条数据
      .exec(cb)
  },
}

// 将模式导出
module.exports = MovieSchema
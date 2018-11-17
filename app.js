var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./models/movie')
var port = process.env.PORT || 3000;
var app = express();

mongoose.connect('mongodb://127.0.0.1:27017/imovie', { useNewUrlParser: true })
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongodb connect error !'))
db.once('open', function() {
console.log('Mongodb started !')
})

app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));//设置express中间件，对数据格式文本化
app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');
// 首页
app.get('/', function(req, res) {
  Movie.fetch(function(err, movies) { // 查询数据
    if (err) {
      console.log(err)
    }

    res.render('index', {
      title: 'imovie 首页',
      movies: movies
    });
  })
})

// 详情页
app.get('/movie/:id', function(req, res) {
  var id = req.params.id; // 拿到id

  Movie.findById(id, function(err, movie) {
    res.render('detail', {
      title: 'imovie' + movie.title,
      movies: movie
    });
  })
})

// 后台录入页
app.get('/admin/movie', function(req, res) {
  res.render('admin', {
    title: 'imovie 后台',
    movie: {
      title: '',
      doctor: '',
      country: '',
      year: '',
      language: '',
      poster: '',
      flash: '',
      summary: ''
    }
  });
})

// admin update movie 修改更新
app.get('/admin/update/:id', function(req, res) {
  var id = req.params.id
  if (id) {
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err)
      }

      res.render('admin', {
        title: 'iomvie 后台更新页',
        movie: movie
      })
    })
  }
})


// admin post movie 拿到从后台录入页post过来的数据
app.post('/admin/movie/new', function(req, res) {
  var id = req.body.movie._id
  var movieObj = req.body.movie
  var _movie
  if (id !== 'undefined') { // 如果这条数据的 id 不是 undefined
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err)
      }
      // extend_.extend(destination, *sources) 
      // 复制source对象中的所有属性覆盖到destination对象上，并且返回 destination 对象. 复制是按顺序的, 所以后面的对象属性会把前面的对象属性覆盖掉(如果有重复).
      // _.extend({name: 'moe'}, {age: 50});
      // => {name: 'moe', age: 50}
      // 后面的对象覆盖前面的
      _movie = _.extend(movie, movieObj)
      _movie.save(function(err, movie) { // 存到数据库
        if (err) {
          console.log(err)
        }

        res.redirect('/movie/' + movie._id) // 重定向
      })
    })
  } else { // 如果是新加的数据
    _movie = new Movie({
      doctor: movieObj.doctor,
      title: movieObj.title,
      country: movieObj.country,
      language: movieObj.language,
      year: movieObj.year,
      poster: movieObj.poster,
      summary: movieObj.summary,
      flash: movieObj.flash
    })

    _movie.save(function(err, movie) { // 存到数据库
      if (err) {
        console.log(err)
      }

      res.redirect('/movie/' + movie._id) // 重定向
    })
  }
})


// 后台列表页
app.get('/admin/list', function(req, res) {
  Movie.fetch(function(err, movies) { // 查询数据
    if (err) {
      console.log(err)
    }

    res.render('list', {
      title: 'imovie 列表页',
      movies: movies
    });
  })

})

// list delete movie
app.delete('/admin/list', function(req, res) {
  var id = req.query.id

  if (id) {
    Movie.remove({_id: id}, function(err, movie) {
      if (err) {
        console.log(err)
      } else {
        res.json({success: 1})
      }
    })
  }
})

app.listen(port);

console.log('imovie started on port ' + port);
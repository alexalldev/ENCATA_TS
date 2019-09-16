var express = require('express');
var app = express();
var requestify = require('requestify');

const session = require('express-session')
const FileStore = require('session-file-store')(session)

app.set('view engine', 'ejs');
var randomstring = require("randomstring");

var sessionMiddleware = 
session({
  secret: "SECRETWORDENCATETS",
  store: new FileStore({logFn: function(){}}),
  cookie:
  {
    path: "/",
    httpOnly: true
  },
  resave: false,
  saveUninitialized: false
})

app.use(sessionMiddleware);

app.listen(8080);

const db = require('./config/database');
db.authenticate().then(() => {
    console.log('Connection has been established successfully.');
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });

var Course = require('./models/Course');
var Symbol = require('./models/Symbol');

//          Script
requestify.get('https://api.hitbtc.com/api/2/public/ticker')
.then(function(res) {
    var elements = res.getBody()
    //var elements = [{"ask":"0.00000004595","bid":"0.00000004557","last":"0.00000004551","open":"0.00000004550","low":"0.00000004410","high":"0.00000004700","volume":"6189700","volumeQuote":"0.285283660","timestamp":"2019-09-16T18:25:13.765Z","symbol":"BCNBTC"},{"ask":"10139.53","bid":"10139.52","last":"10139.70","open":"10295.88","low":"10076.61","high":"10358.69","volume":"11059.58648","volumeQuote":"113300172.1807099","timestamp":"2019-09-16T18:27:24.155Z","symbol":"BTCUSD"},{"ask":"0.008788","bid":"0.008773","last":"0.008784","open":"0.008646","low":"0.008609","high":"0.009136","volume":"13732.248","volumeQuote":"120.166417634","timestamp":"2019-09-16T18:27:25.804Z","symbol":"DASHBTC"}];
    
    Course.findOne({where: {First: true}})
    .then(async course => {
        if (course)
            course.update({First: false})
            for (var e in elements)
            {
                await Course.create({Last: elements[e].last, Timestamp: elements[e].timestamp, First: e == 0 ? true : false})
                .then(async course => {
                    First = false;
                    await Symbol.create({Symbol: elements[e].symbol, Course_Id: course.get().CourseId})
                    .then()
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            }
    })
    .catch(err => console.log(err))
    
})

//          Server

const Op = require('sequelize').Op;

app.get('/', function(req, res) {
    GetCourses(function(courses) {
        res.render('index', {courses: courses});
    });
});

app.get('/addForm', function(req, res) {
    if (!req.session.UID)
    {
        req.session.UID = randomstring.generate();
    }
    GetCourses(function(courses) {
        res.render('addForm', {courses: courses});
    });
});

var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({extended: false});

app.post('/SendValues', urlencodedParser, function(req, res) {
    var date = new Date();
    Course.create({Last: req.body.Last, Timestamp: date.getTime(), First: false, UID: req.session.UID ? req.session.UID : null})
        .then(async course => {
            await Symbol.create({Symbol: req.body.Symbol, Course_Id: course.get().CourseId})
            .then(() => {
                res.end('true');
            })
            .catch(err => res.end('false'))
        })
        .catch(err => res.end('false'))
});

function GetCourses(callback) {
    Course.findOne({where: {First: true}, raw: true})
    .then(firstCourseInterval => {
        if (firstCourseInterval)
            Course.max('CourseId')
            .then(secondCourseInterval => {
                Course.findAll({where: {CourseId: {[Op.between]: [firstCourseInterval.CourseId, secondCourseInterval]}}, raw: true})
                .then(async courses => {
                    for (var course of courses)
                    {
                        await Symbol.findOne({where: {Course_Id: course.CourseId}, raw: true})
                        .then(symbol => {
                            course.Symbol = symbol.Symbol;
                        })
                    }
                    await callback(courses);
                })
            })
            
    })
    .catch(err => console.log(err))
}
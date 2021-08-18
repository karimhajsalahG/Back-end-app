var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const CryptoJS = require("crypto-js");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
const pool = require('./db')

app.use(logger('dev'));
app.use(express.json());
pool.query("CREATE TABLE userr(id SERIAL PRIMARY KEY ,email text NOT NULL, Password text NOT NULL)", 
      (err, res) => {
      console.log(err, res);
     // pool.end();
  });
pool.query("CREATE TABLE url (id SERIAL PRIMARY KEY ,lien text NOT NULL, vues INT DEFAULT 0 , userId INT )", 
      (err, res) => {
      console.log(err, res);
     // pool.end();
  });
app.post("/visteUrl",async(req, res)=>{
  const {id} = req.body
  const sqlRequest = await pool.query("UPDATE url SET vues = vues + 1 WHERE id = $1", [id])
  res.json({"vues" : sqlRequest.rows})
})
app.get("/allUrls/:connectedUser", async(req , res)=>{
  const {connectedUser} = req.params
  const allURls = await pool.query("SELECT * FROM url WHERE userId = $1", [connectedUser] )
  res.json({AllUrls : allURls.rows})
})
app.post("/addUrl", async(req, res)=>{
  const { url , connectedUser } = req.body;
  const newtest = await pool.query(" INSERT INTO url  (lien , userId) VALUES ($1 ,$2)",[url , connectedUser ])
res.json({"lien" : newtest.rows})
})
app.post("/login" , async (req , res)=>{
  const { email , Password } = req.body;
  const allUsers = await pool.query("SELECT * FROM userr WHERE email= $1",[email])
  const passcrypt =CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Password))
  if(allUsers.rows.length==0){
    res.json({"Result" : false })
  }
  else{
  if(allUsers.rows[0].password == passcrypt){
    res.json({"Result" : true , "connectedUser": allUsers.rows[0].id})
  }
  else{
    res.json({"Result" : false })
  }
}
})
app.post("/register",async (req, res)=>{
  const { email , Password } = req.body;
  const passcrypt =CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Password))

  const testuser = await pool.query("SELECT * FROM userr WHERE email= $1",[email])
  if(testuser.rows.length>0){
    res.json({"Result" : false })
  }else{
    const newtest = await pool.query(" INSERT INTO userr  (email,Password) VALUES ($1,$2)",[email,passcrypt])
    res.json({"Result" : true })
  }
})
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

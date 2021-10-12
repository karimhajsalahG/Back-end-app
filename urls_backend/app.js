var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const CryptoJS = require("crypto-js");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const nodemailer = require('nodemailer');
var app = express();
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
const pool = require('./db');
const { Console } = require('console');

app.use(logger('dev'));
app.use(express.json());

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
app.get("/testttt", async(req , res)=>{
  const {connectedUser} = req.params
  const allURls = await pool.query("SELECT *  FROM CreateUseradd " )


 
  res.json({AllUrls : allURls.rows})
})
app.post("/addUrl", async(req, res)=>{
  const { url , connectedUser } = req.body;
  const newtest = await pool.query(" INSERT INTO url  (lien , userId) VALUES ($1 ,$2)",[url , connectedUser ])
res.json({"lien" : newtest.rows})
})
app.post("/login" , async (req , res)=>{
  const { email , Password } = req.body;

  const allUsers = await pool.query("SELECT * FROM CreateUseradd WHERE email= $1 and confirme='accepte'",[email])
  const passcrypt =CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Password))
console.log("1233",allUsers.rows.length)
  if(allUsers.rows.length==0){
    console.log("123355")
    res.json({"Result" : false })
  }
  else{
  if(allUsers.rows[0].password == passcrypt){
    console.log("123344")
    res.json({"Result" : true , "connectedUser": allUsers.rows[0].id})
  }
  else{
    res.json({"Result" : false })
  }
}
})
app.get("/valide/:id", async (req, res) => {
  const {connectedUser} = req.params

  const sqlRequest = await pool.query("UPDATE CreateUseradd SET Confirme = 'accepte' WHERE id = $1", [req.params.id])
  const allURls = await pool.query("SELECT * FROM CreateUseradd " )
  res.send( "Votre adresse e-mail a été confirmée avec succès. Veuillez vous connecter");
});

app.post("/register",async (req, res)=>{
  const { email , Password } = req.body;
  const passcrypt =CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Password))

  const testuser = await pool.query("SELECT * FROM CreateUseradd WHERE email= $1",[email])
  if(testuser.rows.length=0){
    res.json({"Result" : false })
  }else{
    const newtest = await pool.query(" INSERT INTO CreateUseradd  (email,Password,Confirme) VALUES ($1,$2,'confirme')",[email,passcrypt])
    const testuser2 = await pool.query("SELECT * FROM CreateUseradd WHERE email= $1",[email])
    console.log(testuser2.rows[0].id)
    var link = `http://localhost:3000/valide/${testuser2.rows[0].id}`;
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // should be replaced with real sender's account
        user: "testangular123456789@gmail.com",
        pass: "testangular",
      },
    });
  
    let mailOptions = {
      // should be replaced with real recipient's account
  
      from: "testangular123456789@gmail.com",
      to: email,
      subject: "Confirmation compte",
      html:
      "<b>Bienvenue sur App</b><br> bonjour Merci de vous être abonné. Veuillez confirmer votre email en cliquant sur le lien suivant Cliquez ici " +" "+link
      
    };
    //  console.log("mailOptions", mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return;
       
      }else{
        console.log("yes")
      }
    });
   console.log("rrrr");
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

const express = require('express');
const bodyParser = require('body-parser');
const tgsController = require('./controllers/tgsController');
const mongoose = require('mongoose');
const models = require('./models/models');
const nodemailer=require('nodemailer');
const path=require('path');
const exphbs=require('express-handlebars');
var $ = require('jquery');  

const app = express();

//set up template engine
app.set('view engine', 'ejs');
app.engine('handlebars',exphbs({ extname: "hbs", defaultLayout: false, layoutsDir: "views/ "}));

const cookieParser = require('cookie-parser');
const session = require('express-session');
const { Console } = require('console');

// body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
var urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.json());

//static folder
app.use(express.static(path.join(__dirname+'/public')));

//set the path of the jquery file to be used from the node_module jquery package  
app.use('/jquery',express.static(path.join(__dirname+'/node_modules/jquery/dist/')));

app.use(cookieParser());
app.use(session({
  secret: "SecretKey",
  resave: false,
    saveUninitialized: true
    }));

//connect to db 
mongoose.connect('mongodb://localhost/tgs', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

//static files
app.use('/assets', express.static('./public/assets'));
app.use('/images', express.static('./public/images'));
app.use('/videos', express.static('./public/videos'));

//AJAX routes  
app.use('/task',require('./routes/taskroute'));  

//OTP VERIFICATION
var email;

var otp;

function generateOtp(){
    var otp1 = Math.random();
    otp1 = otp1 * 1000000;
    otp1 = parseInt(otp1);
    console.log(otp1);
    return otp1;
}

function checkTime(otp){
    var IdealTimeOut = 20; //10 seconds
    var otp2;
        var idleSecondsTimer = null;
        var idleSecondsCounter = 0;
        idleSecondsTimer = setInterval(CheckIdleTime, 1000);
 
        function CheckIdleTime() {
            idleSecondsCounter++;
            if (idleSecondsCounter >= IdealTimeOut) {
                clearInterval(idleSecondsTimer);
                otp2 = 0;
                console.log(otp2);
                return otp2;
        //        window.location = "http://localhost:3000/signup";
            }
            else{
                otp2 = otp;
                return otp2;
            }
        }
}

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service : 'Gmail',
    
    auth: {
		user: 'iwp.project.sdk@gmail.com',
		pass: 'Saloni1234'
    } 
});

app.post('/send', urlencodedParser, function(req,res) {
    otp = generateOtp();
    email=req.body.email;

    var mailOptions={
        to: req.body.email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>"
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
        res.render('otp.handlebars');
        tgsController.sendSubmit(req, res); 
    });
    var IdealTimeOut = 20; //10 seconds
        var idleSecondsTimer = null;
        var idleSecondsCounter = 0;
        idleSecondsTimer = setInterval(CheckIdleTime, 1000);
 
        function CheckIdleTime() {
            idleSecondsCounter++;
            if (idleSecondsCounter >= IdealTimeOut) {
                clearInterval(idleSecondsTimer);
                otp = 0;
                console.log(otp);
            }
        }
});

//app.post('/signupSubmit', urlencodedParser, function(req, res){
//	tgsController.signupSubmit(req, res);
//});

app.post('/verify',urlencodedParser, function(req,res){
    if(req.body.otp==otp){
        console.log("You has been successfully registered")
        res.render('index',{message: '', user: req.session.user});
        console.log(otp);
    }
    else if(otp==0){
        res.render('otp.handlebars',{msg : 'otp has expired!'});
        console.log("OTP expired");
    }
    else{
        res.render('otp.handlebars',{msg : 'otp is incorrect'});
        console.log(otp);
    }
});  

app.post('/resend',function(req,res){
    otp = generateOtp();
    console.log(otp);
    var mailOptions={
        to: email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('otp.handlebars',{msg:"otp has been sent"});
    });
    var IdealTimeOut = 20; //10 seconds
        var idleSecondsTimer = null;
        var idleSecondsCounter = 0;
        idleSecondsTimer = setInterval(CheckIdleTime, 1000);
 
        function CheckIdleTime() {
            idleSecondsCounter++;
            if (idleSecondsCounter >= IdealTimeOut) {
                clearInterval(idleSecondsTimer);
                otp = 0;
                console.log(otp);
            }
        }
});  

app.get('/index', function(req, res){
	res.render('index', {message: '', user: req.session.user});
});

app.post('/subscribe', urlencodedParser, function(req, res){
	var status = tgsController.sendMail(req.body.mailid);
	console.log('Email sent', status);
			res.render('index', {user: req.session.user, message: 'You have successfully signed up :)'});
});

app.get('/about', function(req, res){
	res.render('about', {user: req.session.user});
});

app.get('/profile', function(req, res){
	tgsController.printProfile(req, res);
});

app.get('/cart', function(req, res){
	tgsController.printCart(req, res);
});

app.get('/payment', function(req, res){
	res.render('payment', {user: req.session.user});
});

app.get('/ordersuccess', function(req, res){
	tgsController.cart2orders(req, res);
});

app.get('/creditcard', function(req, res){
	res.render('creditcard', {user: req.session.user});
});

app.get('/debitcard', function(req, res){
	res.render('debitcard', {user: req.session.user});
});

app.get('/netbanking', function(req, res){
	res.render('netbanking', {user: req.session.user});
});

app.get('/location', function(req, res){
	res.render('location', {user: req.session.user});
});

app.get('/reservation', function(req, res){
	res.render('reservation', {user: req.session.user});
});

app.get('/reservesuccess', function(req, res){
	res.render('reservesuccess', {user: req.session.user});
});

app.get('/orders', function(req, res){
	tgsController.printOrders(req, res);
});

app.get('/login', function(req, res){
	res.render('login', {message: ''});
});

app.get('/logout', function(req, res){
	tgsController.logout(req, res);
});

app.get('/forgotPassword', function(req, res){
	res.render('forgotPassword', {message: ''});
});

app.get('/menu', function(req, res){
	tgsController.fetchMenu(req, res);
});

app.get('/signup', function(req, res){
	res.render('signup');
});

app.get("*", function(req,res){
    res.render('404', {user: req.session.user});
});

app.post('/deleteFromCart', urlencodedParser, function(req, res){
	tgsController.deleteFromCart(req, res);
});

app.post('/updateMenu', urlencodedParser, function(req, res){
	var i = tgsController.updateMenu(req.body, res);
});

app.post('/loginSubmit', urlencodedParser, function(req, res){
	tgsController.loginSubmit(req, res);
});

app.post('/forgotPasswordSubmit', urlencodedParser, function(req, res){
	tgsController.forgotPasswordSubmit(req.body, res);
});

app.post('/add2cart', urlencodedParser, function(req, res){
	tgsController.add2cart(req, res);
});

app.post('/editProfile', urlencodedParser, function(req, res){
	tgsController.editProfile(req, res);
});

app.listen(3000, function(){
	console.log('**Now listening for requests at :3000**');
});

module.exports.app = app;
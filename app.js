const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookie = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const parent = require('./models/parent');
const student = require('./models/student');
const { isBuffer } = require('util');

mongoose.connect("mongodb+srv://Nishant:nishant1234@cluster0.m0yjk.mongodb.net/learnIt?retryWrites=true&w=majority",{ useNewUrlParser: true , useUnifiedTopology: true, useCreateIndex : true, useFindAndModify : false})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookie());
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'woot',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// ==================================================== VERIFY Function =========================================================================
async function verify(req, res, next) {
    console.log(req.cookies);
    const token = await req.cookies.token;
    if (!token) {
        req.auth = "Not allowed";
        next();
    }
    else {
        try {
            const decode = await jwt.verify(token, "mysecretKEY", { algorithm: 'HS256' })
            req.dataa = decode;
            req.auth = "allowed"
            next();
        }
        catch (e) {
            console.log(e.message);
            req.auth = "Not allowed";
            next();
        }

    }
}

app.get('/', (req, res) => {
    console.log("GET :/Home page");
    res.render("home");
});

app.get('/com', verify, (req, res) => {
    console.log('GET: /com');
    res.render('com');
});

app.get('/grade1', verify, (req, res) => {
    console.log("GET :/grade1");
    res.render('grade1');
});

app.get('/grade2', verify, (req, res) => {
    console.log("GET :/grade2");
    res.render('grade2');
});

app.get('/grade3', verify, (req, res) => {
    console.log("GET :/grade3");
    res.render('grade3');
});

app.get('/grade4', verify, (req, res) => {
    console.log("GET :/grade4");
    res.render('grade4');
});

app.get('/grade5', verify, (req, res) => {
    console.log("GET :/grade5");
    res.render('grade5');
});

app.get('/chat1',verify, (req, res) => {
    console.log("GET: /chat1");
    res.render('chat1');
});

app.get('/chat2',verify, (req, res) => {
    console.log("GET: /chat2");
    res.render('chat2');
});

app.get('/index', verify, (req, res) => {
    console.log("GET: /index");
    // parentID = req.dataa.id;
    // console.log(parentID);
    res.render('index');
});

app.get('/addChild', verify, (req, res) => {
    console.log("GET :/addChild");
    res.render("addChild");
});

app.post('/addChild', verify, async (req, res) => {
    console.log('POST: /addChild');
    var parentID = req.dataa.id;

    console.log(parentID);

    try{
        let foundParent = await parent.findById(parentID);

        var username = req.body.username;
        foundStudent = await student.findOne({username: username});
        await foundParent.children.push(foundStudent);
        console.log(foundParent);
        await parent.findByIdAndUpdate(parentID, {children : foundParent.children});
        res.redirect("/index");
    }
    catch (err){
        console.log(err);
    }
});

app.get('/createSchedule', verify, (req, res) => {
    console.log("GET: /createSchedule");
    parentID = req.dataa.id;
    console.log("Parent ID: ", parentID);
    children = [];
    parent.findById(parentID, async (err, foundParent) => {
        if (err) {
            console.log("Error in finding the parent in createSchedule");
            console.log(err);
        } else {
            for (let i = 0; i < foundParent.children.length; i++) {
                children.push(foundParent.children[i]);
            }
            console.log("Children");
            console.log(children);
            res.render("createSchedule", { children: children });
        }
    });
    console.log("Usernames outside the findById function");
    console.log(children);
});

app.get('/createSchedule/:id', verify, async (req, res) => {
    console.log("GET: /createSchedule");
    try {
      parentID = req.dataa.id;
      var studentID = req.params.id;
      let studentt  = await student.findById(studentID);
      res.render('createTimetable')
    } catch (e) {
      console.log(e);
    }
})

app.post('/createSchedule/:id',verify,async(req,res)=>{
  console.log("POST : /createSchedule");
  let {date , time , task} = req.body;
  parentID = req.dataa.id;
  var studentID = req.params.id;
  console.log(studentID);
  let studentTaks  = await student.findById(studentID);
  console.log(studentTaks);
  let staks = studentTaks.tasks;
  let newTask ={
    date : date,
    time : time,
    task : task
  }
  staks.push(newTask)

  await student.findByIdAndUpdate(studentID , {tasks : staks});
  res.redirect("indexc")

})

app.get('/indexc', verify, (req, res) => {
    console.log("GET: /indexc");

    res.render('indexc');
});

app.get('/post', verify, (req, res) => {
    console.log("GET: /post");
    res.render('post');
});

app.get('/loginc', (req, res) => {
    console.log("GET: /loginc");
    res.render("loginc");
});

app.post('/loginc', async (req, res) => {
    console.log("POST: /childLogin");
    try {
        const { email, password } = req.body;
        const stu = await student.findOne({ email });
        if (!stu) {
            res.json({ message: "Invalid Creds" });
        }
        const value = await bcrypt.compare(password, stu.password);
        const payload = {
            id: stu._id
        }
        if (value) {
            const token = await jwt.sign(payload, "mysecretKEY", { algorithm: 'HS256' });
            res.cookie("token", token, { httpOnly: true });
            res.redirect("/indexc");
        } else {
            res.json({ message: "Invalid Creds" });
        }
    } catch (e) {
        console.log("Error in childLogin");
        console.log(e);
    }
})

app.get('/loginp', (req, res) => {
    console.log("GET: /loginp");
    res.render("loginp");
});

app.post('/loginp', async (req, res) => {
    console.log("POST: /parentLogin");
    try {
        const { username, password } = req.body;
        const par = await parent.findOne({ username });
        if (!par) {
            res.json({ message: "Invalid Creds" });
        }
        const value = await bcrypt.compare(password, par.password);
        const payload = {
            id: par._id
        }
        if (value) {
            const token = await jwt.sign(payload, "mysecretKEY", { algorithm: 'HS256' });
            res.cookie("token", token, { httpOnly: true });
            res.redirect("/index");
        } else {
            res.json({ message: "Invalid Creds" });
        }
    } catch (e) {
        console.log("Error in parentLogin");
        console.log(e);
    }
})

app.get('/signupbeforepage', (req, res) => {
    console.log("GET: /signupbeforepage");
    res.render("signupbeforepage");
});

// ======= Parent SignUp ===============

app.get('/signupp', (req, res) => {
    console.log("GET: /signupp");
    res.render("signupp");
});

app.post('/signupp', async (req, res) => {
    console.log("POST :/signupp");

    var newParent = new parent({
        username: req.body.username,
        email: req.body.email,
        password: ''
    });
    if (req.body.password != req.body.confirmPassword) {
        req.flash("error", "Password mismatch");
        res.render("signupp", { variable: "Error, please try again" });
    } else if (req.body.password.length < 4) {
        req.flash("error", "Password should have a minimum of 8 characters");
        res.render("signupp", { variable: "Error, please try again" });
    } else {
        try {
            const salt = await bcrypt.genSalt(10);
            let password = await bcrypt.hash(req.body.password, salt);
            newParent.password = password;
            await newParent.save();
            console.log("Parent Details:");
            console.log(newParent);
            res.redirect("/index");
        } catch (e) {
            console.log("Error in Parent Sign Up");
            console.log(e);
        }
    }
});

// ======= Student SignUp ===============

app.get('/signups', (req, res) => {
    console.log("GET: /signups");
    res.render("signups");
});

app.post('/signups', async (req, res) => {
    console.log("POST :/signups");

    var newStudent = new student({
        username: req.body.username,
        email: req.body.email,
        selected: 0,
        password: '',
        tasks : []
    });
    if (req.body.password != req.body.confirmPassword) {
        req.flash("error", "Password mismatch");
        res.render("signups", { variable: "Error, please try again" });
    } else if (req.body.password.length < 8) {
        req.flash("error", "Password should have a minimum of 8 characters");
        res.render("signups", { variable: "Error, please try again" });
    } else {
        try {
            const salt = await bcrypt.genSalt(10);
            let password = await bcrypt.hash(req.body.password, salt);
            newStudent.password = password;
            await newStudent.save();
            console.log("Student Details:");
            console.log(newStudent);
            res.redirect("/indexc");
        } catch (e) {
            console.log("Error in Parent Sign Up");
            console.log(e);
        }
    }
});

app.listen(3000,() => {
    console.log("Server is working!!!!");
});

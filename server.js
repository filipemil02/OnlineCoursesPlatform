const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(express.static(path.join(__dirname)));

app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'guest',
    resave: false,
    saveUninitialized: true,
    userId: -1,
    user: {},
    cookie: { secure: false
    }
  }));

app.use(express.json());

app.post('/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        res.status(400).send('Passwords do not match');
        return;
    }

    fs.readFile('./Databases/Accounts.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        if (data === '') {
            data = '[]';
        }

        const accounts = JSON.parse(data);
        const existingAccount = accounts.find(acc => acc.username === username || acc.email === email);

        if (existingAccount) {
            res.status(400).send('Username or email already exists');
            return;
        }
        //get me the number of users
        const users = accounts.length;
        const userId = users + 1;
        const Bought_Courses = [];
        const newAccount = { userId, username, email, password, Bought_Courses};
        accounts.push(newAccount);

        fs.writeFile('./Databases/Accounts.json', JSON.stringify(accounts), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }

            // res.send('Registration successful');
            res.redirect('../login/login.html');
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile('./Databases/Accounts.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        if (data === '') {
            data = '[]';
        }

        const accounts = JSON.parse(data);
        const account = accounts.find(acc => acc.username === username && acc.password === password);

        if (account) {
            req.session.userId = account.userId;
            res.json({ success: true, userId: account.id });
          } else {
            res.json({ success: false });
          }
    });
});

app.get('/getUser', (req, res) => {
    if (req.session.userId) {
        fs.readFile('./Databases/Accounts.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }
            const accounts = JSON.parse(data);
            const account = accounts.find(acc => acc.userId === req.session.userId);

            if (!account) {
                res.status(400).send('User not found');
                return;
            }

            res.json({ success: true, userId: req.session.userId, username: account.username, email: account.email, boughtCourses: account.Bought_Courses });
        });
    } else {
        res.json({ success: false, message: 'User not logged in' });
    }
});


let server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.post('/buyCourse', (req, res) => {
    console.log("da");
    const { userId, courseId } = req.body;
    console.log("Userid:" + userId);
    console.log("Courseid:" + courseId);

    fs.readFile('./Databases/Accounts.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        if (data === '') {
            data = '[]';
        }

        const accounts = JSON.parse(data);
        const account = accounts.find(acc => acc.userId === userId);

        if (!account) {
            res.status(400).send('User not found');
            return;
        }

        if (!account.Bought_Courses) {
            account.Bought_Courses = [];
        }

        account.Bought_Courses.push(courseId);

        fs.writeFile('./Databases/Accounts.json', JSON.stringify(accounts), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }

            res.send({ success: true });
        });
    });
});



app.get('/getBoughtCourses', (req, res) => {
    const userId = Number(req.query.userId);

    fs.readFile('./Databases/Accounts.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        if (data === '') {
            data = '[]';
        }

        const accounts = JSON.parse(data);
        const account = accounts.find(acc => acc.userId === userId);

        if (!account) {
            res.status(400).send('User not found');
            return;
        }

        res.send({ success: true, courses: account.Bought_Courses });
    });
});
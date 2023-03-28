const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();
const methodOverride = require('method-override');

const db = require('./config/db');
const passportConfig = require('./config/passport');
const { handleError, setUserLocal } = require('./middlewares');
const routes = require('./routes');

db.connect();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use('/docs', express.static(path.join(__dirname, 'docs')));

app.set('views', path.join(__dirname, 'views'));


app.use(express.static('uploads'));
app.use(express.static('public'));

app.use(flash());
app.use(setUserLocal);
app.use(methodOverride('_method'));

app.use(routes);

app.use(handleError);

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

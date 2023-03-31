const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const helmet = require('helmet');
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');


require('dotenv').config();
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

const db = require('./config/db');
const passportConfig = require('./config/passport');
const { handleError, setUserLocal } = require('./middlewares');
const routes = require('./routes');


db.connect();

const app = express();

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": [
          "'self'",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://maxcdn.bootstrapcdn.com",
          (req, res) => `'nonce-${res.locals.nonce}'`, // Add this line
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);


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
app.use(expressSanitizer());

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

// Certificate
const options = {
  key: fs.readFileSync('/root/agd/privkey.pem'),
  cert: fs.readFileSync('/root/agd/fullchain.pem')
};

// Create HTTPS server
https.createServer(options, app)
  .listen(443, function () {
    console.log(`Server is running on port 443`);
  });

// Create HTTP server (optional)
const http = express();
http.get('*', function (req, res) {
  res.redirect('https://' + req.headers.host + req.url);
});
http.listen(80, function () {
  console.log(`Server is running on port 80`);
});


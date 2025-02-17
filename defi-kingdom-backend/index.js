const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes");
const passportSetup = require('./passport')
dotenv.config();


// Create an instance of Express
const app = express();


app.use(session({
   secret: 'somethingsecretgoeshere',
   resave: false,
   saveUninitialized: true,
   cookie: { secure: true }
}));


const corsOptions = {
    origin: '*', // Update to match the frontend origin
    credentials: true, // Allow cookies to be sent
  };

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    const allowedOrigin = "*"; // Update this to your frontend origin
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials
    next();
});


// Sync models with the database
const sequelizeDB = require("./config/db.config");
sequelizeDB.sequelize.sync(sequelizeDB);

app.use(passport.initialize());
app.use(passport.session());


// Define routes
app.use("/v1", routes);

// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
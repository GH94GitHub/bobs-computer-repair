/*
==========================================
; Title: app.js
; Author: Professor Krasso
; Modified by: George Henderson, Kevin Jones
; Date: 16 Sep 2021
; Description: App file for the server
; ========================================
*/

/**
 * Require statements
 */
const compression = require("compression");
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

/**
 * Routes
 */
const UserApi = require("./routes/user-api");
const SecurityQuestionApi = require("./routes/security-questions-api");
const SessionApi = require("./routes/session-api");
const InvoiceApi = require("./routes/invoice-api");
const RoleApi = require("./routes/role-api");

/**
 * App configurations
 */
let app = express();

app.use(compression()); // compress all responses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../dist/bcrs")));
app.use("/", express.static(path.join(__dirname, "../dist/bcrs")));

/**
 * Variables
 */
const port = process.env.PORT || 3000; // server port


const conn = process.env.BCRS_DB_CONN || "";

/**
 * Database connection
 */
mongoose
  .connect(conn, {
    promiseLibrary: require("bluebird"),
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.debug(`Connection to the database instance was successful`);
  })
  .catch((err) => {
    console.error(`MongoDB Error: ${err.message}`);
  }); // end mongoose connection

/**
 * API(s) go here...
 */
app.use(cors());
app.use("/bcrs/users", UserApi);
app.use("/bcrs/security-questions", SecurityQuestionApi);
app.use("/bcrs/session", SessionApi);
app.use("/bcrs/invoices", InvoiceApi);
app.use("/bcrs/roles", RoleApi);

/**
 * Create and start server
 */
http.createServer(app).listen(port, function () {
  console.log(`Application started and listening on port: ${port}`);
}); // end http create server function

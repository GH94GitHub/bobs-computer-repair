/*
==========================================
; Title: app.js
; Author: Professor Krasso
; Modified by: Kevin Jones
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


const conn =
  "mongodb+srv://tony:Spike%251994@cluster0.pasvdtz.mongodb.net/bcrs?retryWrites=true&w=majority&appName=Cluster0";

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
    console.log(`MongoDB Error: ${err.message}`);
  }); // end mongoose connection

/**
 * API(s) go here...
 */
app.use("/api/users", UserApi);
app.use("/api/security-questions", SecurityQuestionApi);
app.use("/api/session", SessionApi);
app.use("/api/invoices", InvoiceApi);
app.use("/api/roles", RoleApi);

/**
 * Create and start server
 */
http.createServer(app).listen(port, function () {
  console.log(`Application started and listening on port: ${port}`);
}); // end http create server function

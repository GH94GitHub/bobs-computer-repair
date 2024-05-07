/*
============================================
; Title:  security-question.js
; Author: Fred Marble
; Modified By: George Henderson
; Date: 15 Sep 2021
; Description: Security Question Model
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Defining the Security Question Schema

const securityQuestionSchema = new Schema(
  {
    text: { type: String },
    isDisabled: { type: Boolean, default: false },
  },
  { collection: "securityQuestions" }
);
const securityQuestionCollection = mongoose.model("SecurityQuestion", securityQuestionSchema);

// Default Values
securityQuestionCollection.countDocuments({}, (err, count) => {
  if(err) {
    console.error("There was an error counting Security Questions Collection documents");
  }
  if(count === 0) {
    const securityQuestions = [
      { text: "What is your mother's maiden name?" },
      { text: "What city were you born in?" },
      { text: "What is the name of your first pet?" },
      { text: "What is your favorite book?" },
      { text: "What was the name of your elementary school?" },
      { text: "What is the name of your favorite teacher?" },
      { text: "What is the make and model of your first car?" },
      { text: "In what year did you graduate from high school?" },
      { text: "What is your favorite movie?" },
      { text: "What is your favorite food?" },
      { text: "What is the name of your best childhood friend?" },
      { text: "What is your favorite sports team?" },
      { text: "What is the name of the street you grew up on?" },
      { text: "What is your favorite vacation destination?" },
      { text: "What is the name of your favorite fictional character?" },
    ];
    securityQuestionCollection.insertMany(securityQuestions);
  }
});
module.exports = securityQuestionCollection;;

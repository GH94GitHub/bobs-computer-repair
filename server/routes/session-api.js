/*===============================
; Title: Session API
; Date: 17 September 2021
; Author: George Henderson
; Modified by: Kevin Jones
; Description: API for session routes.
===============================*/

const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BaseResponse = require("../services/base-response");
const ErrorResponse = require("../services/error-response");

const router = express.Router();
const config = require("../../config");

const saltRounds = 10; // default salt rounds for bcrypt hashing algorithm

/**
 * POST Sign In
 * Attempts to sign the user in given 'userName' & 'password' in req.body
 * Sends the proper error messages back to the client
 */
router.post("/signin", async (req, res) => {
  try {
    User.findOne({ userName: req.body.userName }, (err, user) => {
      // Server error
      if (err) {
        console.error(err);

        // Send 500 Response: 'Internal Server Error'
        const authenticateError = new ErrorResponse(
          500,
          "Internal Server Error",
          err
        );
        return res.status(500).send(authenticateError.toObject());
      }
      // Query went through
      else {
        // No user found - 404
        if (!user) {
          const noUserError = new ErrorResponse(
            404,
            `The username '${req.body.userName}' was not found.`,
            null
          );
          return res.status(401).send(noUserError.toObject());
        }

        const isAuthenticated = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        // Password is invalid
        if (!isAuthenticated) {
          const invalidPasswordResponse = new BaseResponse(
            401,
            "Invalid Password",
            null
          );

          // Send 401 response & BaseResponse: 'Invalid Password'
          return res.status(401).send(invalidPasswordResponse.toObject());
        }
        // Password matches user
        else {
          // Sign jsonwebtoken
          var token = jwt.sign(
            { session_user: req.params.userName },
            config.web.secret,
            {
              expiresIn: "24h",
            }
          );

          // Send 200 response & BaseResponse: 'Login Successful'
          const logInSuccessful = new BaseResponse(200, "Login Successful", {
            auth: true,
            userName: user.userName,
            token: token,
          });
          return res.status(200).send(logInSuccessful.toObject());
        }
      }
    });
  } catch (e) {
    console.error(e);

    // Send 500 response & ErrorResponse: 'Internal Server Error'
    const authenticateCatchErrorResponse = new ErrorResponse(
      500,
      "Internal Server Error",
      e.message
    );
    return res.status(500).send(authenticateCatchErrorResponse.toObject());
  }
});

/**
 * GET Verify User
 * Accepts 'userName' from req.body
 * Attempts to verify the username exists
 * Returns the user.
 */
router.get("/verify/users/:userName", async (req, res) => {
  try {
    User.findOne({ userName: req.params.userName }, function (err, user) {
      // Error processing query
      if (err) {
        console.error(err);
        const verifyUserMongodbErrorResponse = new ErrorResponse(
          "500",
          "Internal service error",
          err
        );
        return res.status(500).send(verifyUserMongodbErrorResponse.toObject());
      }
      // Successful query
      else {
        // No user found
        if (!user) {
          const invalidUsernameResponse = new BaseResponse(
            "400",
            "Invalid username",
            req.params.userName
          );
          return res.status(400).send(invalidUsernameResponse.toObject());
        }
        // User exists
        else {
          const userVerifiedResponse = new BaseResponse(
            "200",
            "User verified",
            user
          );
          return res.status(200).send(userVerifiedResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.error(e.message);
    const verifyUserCatchResponse = new ErrorResponse(
      "500",
      "Internal service error",
      e.message
    );
    return res.status(500).send(verifyUserCatchResponse.toObject());
  }
});

/**
 * verifySecurityQuestions
 */
router.post("/verify/users/:userName/security-questions", async (req, res) => {
  // Get user from database
  try {
    User.findOne({ userName: req.params.userName }, function (err, user) {
      // Server error
      if (err) {
        console.error(err); // Log error to console
        // Send 500 response & ErrorResponse: 'Internal Server Error'
        const verifySecurityQuestionsMongodbErrorResponse = new ErrorResponse(
          "500",
          "Internal sever error",
          err
        );
        res
          .status(500)
          .send(verifySecurityQuestionsMongodbErrorResponse.toObject());
        // Query went through
      } else {
        // find security questions
        const selectedSecurityQuestionOne = user.selectedSecurityQuestions.find(
          (q) => q.questionText === req.body.questionText1
        );

        const selectedSecurityQuestionTwo = user.selectedSecurityQuestions.find(
          (q2) => q2.questionText === req.body.questionText2
        );

        const selectedSecurityQuestionThree =
          user.selectedSecurityQuestions.find(
            (q3) => q3.questionText === req.body.questionText3
          );

        // check if answers match

        const isValidAnswerOne =
          selectedSecurityQuestionOne.answerText === req.body.answerText1;

        const isValidAnswerTwo =
          selectedSecurityQuestionTwo.answerText === req.body.answerText2;

        const isValidAnswerThree =
          selectedSecurityQuestionThree.answerText === req.body.answerText3;

        // if all answers match
        if (isValidAnswerOne && isValidAnswerTwo && isValidAnswerThree) {
          console.info(
            `User ${user.userName} answered their security questions correctly`
          );
          // send base response with 200 status
          const validSecurityQuestionsResponse = new BaseResponse(
            "200",
            "success",
            user
          );
          res.json(validSecurityQuestionsResponse.toObject());
          // if answers do not match
        } else {
          // send base response with 200 status
          const invalidSecurityQuestionsResponse = new BaseResponse(
            "200",
            "error",
            user
          );
          res.json(invalidSecurityQuestionsResponse.toObject());
        }
      }
    });
    // catch error
  } catch (e) {
    console.error(e); // log error to console
    // send 500 response & ErrorResponse: 'Internal Server Error'
    const verifySecurityQuestionsCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal server error",
      e.message
    );
    res.status(500).send(verifySecurityQuestionsCatchErrorResponse.toObject());
  }
});

/**
 * ResetPassword
 */
router.post("/users/:userName/reset-password", async (req, res) => {
  // Get user from database
  try {
    const password = req.body.password; // get password from req.body

    // find user in database
    User.findOne({ userName: req.params.userName }, function (err, user) {
      // Server error
      if (err) {
        console.error(err); // Log error to console
        // Send 500 response & ErrorResponse: 'Internal Server Error'
        const resetPasswordMongodbErrorResponse = new ErrorResponse(
          "500",
          "Internal server error",
          err
        );
        res.status(500).send(resetPasswordMongodbErrorResponse.toObject());
        // if user is found
      } else {

        let hashedPassword = bcrypt.hashSync(password, saltRounds); // salt/hash the password
        // update user password
        user.set({
          password: hashedPassword,
        });
        // save user
        user.save(function (err, updatedUser) {
          // Server error
          if (err) {
            console.error(err); // Log error to console
            // Send 500 response & ErrorResponse: 'Internal Server Error'
            const updatedUserMongodbErrorResponse = new ErrorResponse(
              "500",
              "Internal server error",
              err
            );
            res.status(500).send(updatedUserMongodbErrorResponse.toObject());
            // if user is found
          } else {
            // send base response with 200 status
            const updatedPasswordResponse = new BaseResponse(
              "200",
              "Query successful",
              updatedUser
            );
            res.json(updatedPasswordResponse.toObject());
          }
        });
      }
    });
    // catch error
  } catch (e) {
    console.error(e); // log error to console
    const resetPasswordCatchError = new ErrorResponse(
      "500",
      "Internal server error",
      e
    );
    res.status(500).send(resetPasswordCatchError.toObject());
  }
});

/**
 * registerUser
 */
router.post("/register", async (req, res) => {
  try {
    // salt and hash the password
    let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
    // set 'standard' as the default role
    standardRole = {
      role: "standard",
    };

    // user object
    let registeredUser = {
      userName: req.body.userName,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      email: req.body.email,
      role: standardRole,
      selectedSecurityQuestions: req.body.selectedSecurityQuestions,
    };

    // check if the user already exists
    User.findOne({ userName: req.body.userName }, function (err, user) {
      // if there is an error
      if (err) {
        console.error(err); // log the error
        // return an error response
        const createMongodbErrorResponse = new ErrorResponse(
          500,
          "Internal server error",
          err
        );
        // send the error response
        res.status(500).send(createMongodbErrorResponse.toObject());
        // if there is no error
      } else {
        // if the user already exists
        if (user) {
          // return an error response
          const createUserAlreadyExistsErrorResponse = new ErrorResponse(
            400,
            `Username '${req.body.userName}' already exists`,
            user
          );
          // send the error response
          res.status(400).send(createUserAlreadyExistsErrorResponse.toObject());
          // if the user does not exist
        } else {
          // create the user
          User.create(registeredUser, function (err, user) {
            // if there is an error
            if (err) {
              console.error(err); // log the error
              // return an error response
              const createMongodbErrorResponse = new ErrorResponse(
                500,
                "Internal server error",
                err
              );
              // send the error response
              res.status(500).send(createMongodbErrorResponse.toObject());
              // if there is no error
            } else {
              // return a success response
              const createUserResponse = new BaseResponse(
                201,
                "User created",
                user
              );
              // send the response
              res.json(createUserResponse.toObject());
            }
          });
        }
      }
    });

    // if there is an error
  } catch (e) {
    console.error(e); // log the error
    // return an error response
    const createUserCatchErrorResponse = new ErrorResponse(
      500,
      "Internal server error",
      e.message
    );
    // send the error response
    res.status(500).send(createUserCatchErrorResponse.toObject());
  }
});

module.exports = router;

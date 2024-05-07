/*
============================================
; Title:  user-api.js
; Author: Kevin Jones
; Modified by: Fred Marble
; Date: 15 Aug 2021
; Description: User API routes
;===========================================
*/

// require statements
const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const BaseResponse = require("../services/base-response");
const ErrorResponse = require("../services/error-response");
const RoleSchema = require("../schemas/user-role");

const router = express.Router();
const saltRounds = 10; // default salt rounds for bcrypt hashing algorithm

/**
 * find all users
 */
router.get("/", async (req, res) => {
  try {
    // get all users
    User.find({})
      .where("isDisabled")
      .equals(false) // only return users that are not disabled
      // execute the query
      .exec(function (err, users) {
        // if there is an error
        if (err) {
          console.error(err); // log the error
          // return an error response
          const findAllMongodbErrorResponse = new ErrorResponse(
            500,
            "Internal server error",
            err
          );
          // send the error response
          res.status(500).send(findAllMongodbErrorResponse.toObject());
          // if there is no error
        } else {
          // return a success response
          const findAllUsersResponse = new BaseResponse(
            200,
            "Query successful",
            users
          );
          res.json(findAllUsersResponse.toObject()); // send the response
        }
      });
    // if there is an error
  } catch (e) {
    // return an error response
    const findAllCatchErrorResponse = new ErrorResponse(
      500,
      "Internal server error",
      e.message
    );
    // send the error response
    res.status(500).send(findAllCatchErrorResponse.toObject());
  }
});

/**
 * find a user by id
 */
router.get("/:id", async (req, res) => {
  try {
    // get one user by id
    User.findOne({ _id: req.params.id }, function (err, user) {
      // if there is an error
      if (err) {
        console.error(err); // log the error
        // return an error response
        const findByIdMongodbErrorResponse = new ErrorResponse(
          500,
          "Internal server error",
          err
        );
        // send the error response
        res.status(500).send(findByIdMongodbErrorResponse.toObject());
        // if there is no error
      } else {
        // return a success response
        const findByIdResponse = new BaseResponse(
          200,
          "Query successful",
          user
        );
        // send the response
        res.json(findByIdResponse.toObject());
      }
    });
    // if there is an error
  } catch (e) {
    console.error(e); // log the error
    // return an error response
    const findByIdCatchErrorResponse = new ErrorResponse(
      500,
      "Internal server error",
      e.message
    );
    // send the error response
    res.status(500).send(findByIdCatchErrorResponse.toObject());
  }
});

/**
 * create a user
 */
router.post("/", async (req, res) => {
  try {
    // salt and hash the password
    let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
    // set 'standard' as the default role
    standardRole = {
      role: "standard",
    };

    // user object
    let newUser = {
      userName: req.body.userName,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      email: req.body.email,
      role: standardRole,
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
            `The username '${req.body.userName}' is already in use.`,
            "User already exists"
          );
          // send the error response
          res.status(400).send(createUserAlreadyExistsErrorResponse.toObject());
          // if the user does not exist
        } else {
          // create the user
          User.create(newUser, function (err, user) {
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

/**
 * update a user
 */
router.put("/:id", async (req, res) => {
  try {
    // get the user by id
    User.findOne({ _id: req.params.id }, function (err, user) {
      // if there is an error
      if (err) {
        console.error(err); // log the error
        // return an error response
        const updateUserMongodbErrorResponse = new ErrorResponse(
          500,
          "Internal server error",
          err
        );
        // send the error response
        res.status(500).send(updateUserMongodbErrorResponse.toObject());
        // if there is no error
      } else {
        // update the user
        user.set({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          address: req.body.address,
          email: req.body.email,
        });

        // set the user's role
        user.role.set({
          role: req.body.role,
        });

        // save the user
        user.save(function (err, savedUser) {
          // if there is an error
          if (err) {
            console.error(err); // log the error
            // return an error response
            const saveUserMongodbErrorResponse = new ErrorResponse(
              500,
              "Internal server error",
              err
            );
            // send the error response
            res.status(500).send(saveUserMongodbErrorResponse.toObject());
            // if there is no error
          } else {
            // return a success response
            const saveUserResponse = new BaseResponse(
              200,
              "Query successful",
              savedUser
            );
            // send the response
            res.json(saveUserResponse.toObject());
          }
        });
      }
    });
    // if there is an error
  } catch (e) {
    console.error(e); // log the error
    // return an error response
    const updateUserCatchErrorResponse = new ErrorResponse(
      500,
      "Internal server error",
      e.message
    );
    // send the error response
    res.status(500).send(updateUserCatchErrorResponse.toObject());
  }
});

/**
 * delete a user
 */
router.delete("/:id", async (req, res) => {
  try {
    // get the user by id
    User.findOne({ _id: req.params.id }, function (err, user) {
      // if there is an error
      if (err) {
        console.error(err); // log the error
        // return an error response
        const deleteUserMongodbErrorResponse = new ErrorResponse(
          500,
          "Internal server error",
          err
        );
        // send the error response
        res.status(500).send(deleteUserMongodbErrorResponse.toObject());
        // if there is no error
      } else {
        // delete the user (set as disabled)
        user.set({
          isDisabled: true,
        });
        // save the user
        user.save(function (err, savedUser) {
          // if there is an error
          if (err) {
            console.error(err); // log the error
            // return an error response
            const savedUserMongodbErrorResponse = new ErrorResponse(
              500,
              "Internal server error",
              err
            );
            // send the error response
            res.status(500).send(savedUserMongodbErrorResponse.toObject());
            // if there is no error
          } else {
            // return a success response
            const savedUserResponse = new BaseResponse(
              200,
              "Query successful",
              savedUser
            );
            // send the response
            res.json(savedUserResponse.toObject());
          }
        });
      }
    });
    // if there is an error
  } catch (e) {
    console.error(e); // log the error
    // return an error response
    const deleteUserCatchErrorResponse = new ErrorResponse(
      500,
      "Internal server error",
      e.message
    );
    // send the error response
    res.status(500).send(deleteUserCatchErrorResponse.toObject());
  }
});

/**
 * FindSelectedSecurityQuestions
 */
router.get("/:userName/security-questions", async (req, res) => {
  try {
    User.findOne({ userName: req.params.userName }, function (err, user) {
      // handle mongoDB error
      if (err) {
        console.error(err);
        const findSelectedSecurityQuestionsMongodbErrorResponse =
          new ErrorResponse("500", "Internal server error", err);
        res
          .status(500)
          .send(findSelectedSecurityQuestionsMongodbErrorResponse.toObject());
      } else {
        // user object matching params id
        const findSelectedSecurityQuestionsResponse = new BaseResponse(
          "200",
          "Query successful",
          user.selectedSecurityQuestions
        );
        res.json(findSelectedSecurityQuestionsResponse.toObject());
      }
    });
  } catch (e) {
    // Server error
    console.error(e);
    const findSelectedSecurityQuestionsCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal server error",
      e
    );
    res
      .status(500)
      .send(findSelectedSecurityQuestionsCatchErrorResponse.toObject());
  }
});

/**
 * findUserRole
 */
// make call to api to get user role
router.get("/:userName/role", async (req, res) => {
  try {
    // get the user by userName
    User.findOne({ userName: req.params.userName }, function (err, user) {
      if (err) {
        // handle mongoDB error
        console.error(err); // log the error
        // return an error response
        const findUserRoleMongodbErrorResponse = new ErrorResponse(
          "500",
          "Internal server error",
          err
        );
        // send the error response
        res.status(500).send(findUserRoleMongodbErrorResponse.toObject());
      } else {
        // if there is no error return a success response
        const findUserRoleResponse = new BaseResponse(
          "200",
          "Query successful",
          user.role
        );
        // send the response
        res.json(findUserRoleResponse.toObject());
      }
    });
  } catch (e) {
    // handle server error
    console.error(e); // log the error
    // return an error response
    const findUserRoleCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal server error",
      e.message
    );
    // send the error response
    res.status(500).send(findUserRoleCatchErrorResponse.toObject());
  }
});

// export the router
module.exports = router;

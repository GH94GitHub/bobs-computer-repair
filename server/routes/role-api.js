/*
============================================
; Title:  role-api.js
; Author: Fred Marble
; Modified by: Kevin Jones
; Date: 30 Sep 2021
; Description: API for the curd operations for the Role.
;===========================================
*/

const express = require("express");
const Role = require("../models/role");
const User = require("../models/user");
const ErrorResponse = require("../services/error-response");
const BaseResponse = require("../services/base-response");

const router = express.Router();

/**
 * FindAll
 */

router.get("/", async (req, res) => {
  try {
    Role.find({})
      .where("isDisabled")
      .equals(false)
      .exec(function (err, roles) {
        if (err) {
          console.error(err);
          const findAllRolesMongodbErrorResponse = new ErrorResponse(
            "500",
            "Internal Server Error",
            err
          );
          res.status(500).send(findAllRolesMongodbErrorResponse.toObject());
        } else {

          const findAllRolesResponse = new BaseResponse(
            "200",
            "Query Successful",
            roles
          );
          res.json(findAllRolesResponse.toObject());
        }
      });
  } catch (e) {
    console.error(e);
    const findAllRolesCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal Server Error",
      e.message
    );
    res.status(500).send(findAllRolesCatchErrorResponse.toObject());
  }
});

/**
 * FindById
 */
router.get("/:roleId", async (req, res) => {
  try {
    Role.findOne({ _id: req.params.roleId }, function (err, role) {
      if (err) {
        console.error(err);
        const findRoleByIdMongodbErrorResponse = new ErrorResponse(
          "500",
          "Internal Server Error",
          err
        );
        res.status(500).send(findRoleByIdMongodbErrorResponse.toObject());
      } else {

        const findRoleByIdResponse = new BaseResponse(
          "200",
          "Query Successful",
          role
        );
        res.json(findRoleByIdResponse.toObject());
      }
    });
  } catch (e) {
    console.error(e);
    const findRoleByIdCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal Server Error",
      e.message
    );
    res.status(500).send(findRoleByIdCatchErrorResponse.toObject());
  }
});

/**
 * CreateRole
 */
router.post("/", async (req, res) => {
  try {
    Role.findOne({ text: req.body.text }, function (err, role) {
      if (err) {
        console.error(err);
        const findRoleMongodbError = new ErrorResponse(
          "500",
          "Internal server error",
          err
        );
        res.status(500).send(findRoleMongodbError.toObject());
      } else {
        if (!role) {
          const newRole = {
            text: req.body.text,
          };

          Role.create(newRole, function (err, role) {
            if (err) {
              console.error(err);
              const createRoleMongodbErrorResponse = new ErrorResponse(
                "500",
                "Internal server error",
                err
              );
              res.status(500).send(createRoleMongodbErrorResponse.toObject());
            } else {
              console.error(err);
              const createRoleResponse = new BaseResponse(
                "200",
                "Query successful",
                role
              );
              res.json(createRoleResponse.toObject());
            }
          });
        } else {

          const roleAlreadyExists = new ErrorResponse(
            "400",
            `Role '${req.body.text}' already exists.`
          );
          res.status(400).send(roleAlreadyExists.toObject());
        }
      }
    });
  } catch (e) {
    console.error(e);
    const createRoleCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal server error",
      e.message
    );
    res.status(500).send(createRoleCatchErrorResponse.toObject());
  }
});

/**
 * DeleteRole
 */
// delete role by id
router.delete("/:roleId", async (req, res) => {
  try {
    // Find the role by document id
    Role.findOne({ _id: req.params.roleId }, function (err, role) {
      if (err) {
        // if error
        console.error(err); // log error
        // create error response
        const deleteRoleMongodbErrorResponse = new ErrorResponse(
          "500",
          "Internal server error",
          err
        );
        // send error response
        res.status(500).send(deleteRoleMongodbErrorResponse.toObject());
      } else {
        // if no error
        // Aggregate query to determine if the role being deleted is already mapped to an existing user
        User.aggregate(
          [
            {
              $lookup: {
                from: "roles",
                localField: "role.role",
                foreignField: "text",
                as: "userRoles",
              },
            },
            {
              $match: {
                "userRoles.text": role.text,
              },
            },
          ],
          // if the role is mapped to an existing user, return an error response
          function (err, users) {
            if (err) {
              // if error
              console.error(err); // log error
              // create error response
              const usersMongodbErrorResponse = new ErrorResponse(
                "500",
                "Internal server error",
                err
              );
              // send error response
              res.status(500).send(usersMongodbErrorResponse.toObject());
            } else {
              // If the query returns one or more users, then the role is already in user and shouldn't be disabled
              if (users.length > 0) {
                console.warn(
                  `Role <${role.text}> is already in use and cannot be deleted`
                );
                // create error response
                const userRoleAlreadyInUseResponse = new BaseResponse(
                  400,
                  `Role '${role.text}' is in use.`,
                  role
                );
                // send error response
                res.status(400).send(userRoleAlreadyInUseResponse.toObject());
              } else {
                role.set({
                  isDisabled: true,
                });
                // save the role
                role.save(function (err, updatedRole) {
                  if (err) {
                    console.error(err);
                    const updatedRoleMongodbErrorResponse = new ErrorResponse(
                      "500",
                      "Internal server error",
                      err
                    );
                    res
                      .status(500)
                      .send(updatedRoleMongodbErrorResponse.toObject());
                  } else {

                    const roleDeletedResponse = new BaseResponse(
                      "200",
                      `Role '${role.text}' has been removed successfully`,
                      updatedRole
                    );
                    res.json(roleDeletedResponse.toObject());
                  }
                });
              }
            }
          }
        );
      }
    });
  } catch (e) {
    console.error(e);
    const deleteRoleCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal server error",
      e.message
    );
    res.status(500).send(deleteRoleCatchErrorResponse.toObject());
  }
});

/**
 * updateRole
 */
router.put("/:roleId", async (req, res) => {
  try {
    const filter = {
      _id: req.params.roleId,
    };

    const update = req.body;

    Role.findOneAndUpdate(filter, update, { new: true }, function (err, role) {
      if (err) {
        console.error(err);
        const updateRoleMongodbErrorResponse = new ErrorResponse(
          "500",
          "Internal Server Error",
          err
        );
        return res.status(500).send(updateRoleMongodbErrorResponse.toObject());
      }
      // Successful
      else {

        const updateRoleSuccessResponse = new BaseResponse(
          "200",
          "Role Successfully Updated",
          role
        );
        return res.status(200).send(updateRoleSuccessResponse.toObject());
      }
    });
  } catch (e) {
    console.error(e);
    const updateRoleCatchResponse = new ErrorResponse(
      "500",
      "Internal Server Error",
      e.message
    );
    return res.status(500).send(updateRoleCatchResponse.toObject());
  }
});

// export the router
module.exports = router;

/**
 * Date: 15 September 2021
 * Title: security-questions-api.js
 * Author: Fred Marble
 * Modified:
 * Description: This is the security-questions-api for getting and receiving information on the users security questions.
 */

//Requires Statements
const express = require('express');
const BaseResponse = require('../services/base-response');
const ErrorResponse = require('../services/error-response');
const SecurityQuestion = require('../models/security-question');

//Configuration Statements
const router = express.Router();

/**
 * findAll API
 */
router.get('/', async( req, res) =>{
  try
  {
    SecurityQuestion.find({})
    .where('isDisabled')
    .equals(false)
    .exec(function(err, securityQuestions)
    {
      if (err)
      {
        console.error(err);
        const findAllMongodbErrorResponse = new ErrorResponse(500, 'Internal Server Error', err);
        res.status(500).send(findAllMongodbErrorResponse.toObject());
      }
      else
      {
        const findAllResponse = new BaseResponse(200, 'Query Successful', securityQuestions);
        res.json(findAllResponse.toObject());
      }
    })
  }
  catch (e)
  {
    console.error(e);
    const findAllCatchErrorResponse = new ErrorResponse(500, 'Internal Server Error', e.message);
    res.status(500).send(findAllCatchErrorResponse.toObject());
  }
});

/**
 * FindByID
 */

router.get('/:id', async(req, res)=> {
  try
  {
    SecurityQuestion.findOne({'_id': req.params.id}, function(err, securityQuestion){
      if(err)
      {
        console.error(err);
        const findByIdMongodbErrorResponse = new ErrorResponse(500, 'Internal Server Error', err);
        res.status(500).send(findByIdMongodbErrorResponse.toObject());
      }
      else
      {
        const findByIdResponse = new BaseResponse(200, 'Query Successful', securityQuestion);
        res.json(findByIdResponse.toObject());
      }
    })
  }
  catch(e)
  {
    console.error(e);
    const findByIdCatchErrorResponse = new ErrorResponse(500, 'Internal Server Error', e.message);
    res.status(500).send(findByIdCatchErrorResponse.toObject());
  }
})

/**
 * CreateSecurityQuestion
 */

router.post('/', async(req, res)=>{
  try
  {
    let newSecurityQuestion = {
      text: req.body.text
    };

    SecurityQuestion.create(newSecurityQuestion, function(err, securityQuestion){
      if (err)
      {
        console.error(err);
        const createSecurityQuestionMongodbErrorResponse =  new ErrorResponse(500, 'Internal Server Error', err);
        res.status(500).send(createSecurityQuestionMongodbErrorResponse.toObject());
      }
      else
      {
        const createSecurityQuestionResponse = new BaseResponse(200, 'Query Successful', securityQuestion);
        res.json(createSecurityQuestionResponse.toObject());
      }
    })
  }
  catch(e)
  {
    console.error(e);
    const createSecurityQuestionCatchErrorResponse = new ErrorResponse(500, 'Internal Server Error', e.message);
    res.status(500).send(createSecurityQuestionCatchErrorResponse.toObject());
  }
})

/**
 * UpdateSecurityQuestion
 */

router.put('/:id', async(req, res) => {
  try
  {
    SecurityQuestion.findOne({'_id': req.params.id}, function(err, securityQuestion){
      if(err)
      {
        console.error(err);
        const updateSecurityQuestionMongodbErrorResponse = new ErrorResponse(500, 'Internal server error', err);
        res.status(500).send(updateSecurityQuestionMongodbErrorResponse.toObject());
      }
      else{
        securityQuestion.set({
          text: req.body.text
        });

        securityQuestion.save(function( err, savedSecurityQuestion){
          if(err)
          {
            console.error(err);
            const savedSecurityQuestionMongodbErrorResponse = new ErrorResponse(500, 'Internal server error', err);
            res.status(500).send(savedSecurityQuestionMongodbErrorResponse.toObject());
          }
          else
          {
            const updateSecurityQuestionResponse = new BaseResponse(200, 'Query successful', savedSecurityQuestion);
            res.json(updateSecurityQuestionResponse.toObject());
          }
        })
      }
    })
  }
  catch (e)
  {
    console.error(e);
    const updateSecurityQuestionCatchErrorResponse = new ErrorResponse(500, 'Internal Server error', e.message);
    res.status(500).send(updateSecurityQuestionCatchErrorResponse.toObject());
  }
})

/**
 * DeleteSecurityQuestion
 */

router.delete('/:id', async (req, res)=>{
  try
  {
    SecurityQuestion.findOne({'_id': req.params.id}, function(err, securityQuestion){
      if (err)
      {
        console.error(err);
        const deleteSecurityQuestionMongodbErrorResponse = new ErrorResponse(500, 'Internal Server Error', err);
        res.status(500).send(deleteSecurityQuestionMongodbErrorResponse.toObject());
      }
      else
      {
        securityQuestion.set({
          isDisabled: true
        });

        securityQuestion.save(function (err, savedSecurityQuestion){
          if (err)
          {
            console.error(err);
            const savedSecurityQuestionMongodbErrorResponse = new ErrorResponse(500, 'Internal Server Error', err );
            res.status(500).send(savedSecurityQuestionMongodbErrorResponse.toObject());
          }
          else
          {
            const deleteSecurityQuestionResponse = new BaseResponse(200, 'Query Successful', savedSecurityQuestion);
            res.json(deleteSecurityQuestionResponse.toObject());
          }
        })
      }
    })
  }
  catch (e)
  {
    console.error(e);
    const deleteSecurityQuestionCatchErrorResponse = new ErrorResponse(500, 'Internal Server Error', e.message)
    res.status(500).send(deleteSecurityQuestionCatchErrorResponse.toObject());
  }
})

module.exports = router;

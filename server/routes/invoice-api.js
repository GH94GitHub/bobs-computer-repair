/*==========================
; Title: Invoices API
; Date: 30 September 2021
; Author: Tony Henderson
; Description: API for invoice routes.
==========================*/

const express = require('express');
const Invoice = require('../models/invoice');
const BaseResponse = require('../services/base-response');
const ErrorResponse = require('../services/error-response');

const router = express.Router();

/**
 * createInvoice
 */
router.post('/:userName', async ( req, res ) => {

  try {
    const newInvoice = {
      userName: req.params.userName,
      lineItems: req.body.lineItems,
      partsAmount: req.body.partsAmount,
      laborAmount: req.body.laborAmount,
      lineItemTotal: req.body.lineItemTotal,
      total: req.body.total
    }

    Invoice.create(newInvoice, function( err, invoice ) {
      // Server Error
      if (err) {
        // Send 500 ErrorResponse
        const MongoErrorResponse = new ErrorResponse("500", "Internal Server Error", err);
        res.status(500).send(MongoErrorResponse.toObject());
      }
      // Query went through
      else {
        //Send back created invoice
        const createdInvoiceResponse = new BaseResponse("201", "Invoice Created", invoice);
        res.status(201).send(createdInvoiceResponse.toObject());
      }
    });
  }
  catch(e) {
    console.error(e)
    // Send 500 ErrorResponse
    const createInvoiceCatchErrorResponse = new ErrorResponse("500", "Internal Server Error", e.message);
    res.status(500).send(createInvoiceCatchErrorResponse.toObject());
  }

});

/**
 * findPurchasesByService
 */
router.get("/purchases-graph", async (req, res) => {
  try {
    Invoice.aggregate(
      [
        {
          $unwind: "$lineItems",
        },
        {
          $group: {
            _id: {
              title: "$lineItems.title",
              price: "$lineItems.price",
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.title": 1,
          },
        },
      ],
      function (err, purchaseGraph) {
        if (err) {
          console.error(err);
          const findPurchasesByServiceGraphMongodbErrorResponse = new ErrorResponse(
            "500",
            "Internal Server error",
            err
          );
          res
            .status(500)
            .send(findPurchasesByServiceGraphMongodbErrorResponse.toObject());
        } else {
          const findPurchasesByServiceGraphResponse = new BaseResponse(
            "200",
            "Query successful",
            purchaseGraph
          );
          res.json(findPurchasesByServiceGraphResponse.toObject());
        }
      }
    );
  } catch (e) {
    console.error(e);
    const findPurchaseByServiceCatchErrorResponse = new ErrorResponse(
      "500",
      "Internal server error",
      e.message
    );
    res.status(500).send(findPurchaseByServiceCatchErrorResponse.toObject());
  }
});

module.exports = router;

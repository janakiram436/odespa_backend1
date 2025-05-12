const express = require("express");
const fetch = require('node-fetch');  // Importing fetch for making external requests
const router = express.Router();

// Function to create custom payment
function makeCustomPayment(invoiceId, amount, customPaymentId, collectedById) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,                          // The total amount of the invoice, including the tip
      tip_amount: 0.00,                        // No tip provided, you can modify this as needed
      cash_register_id: null,                  // No cash register ID provided, use null
      custom_payment_id: customPaymentId,      // Unique custom payment ID
      additional_data: 'PayU Money',           // Additional info, set to "PayU Money"
      collected_by_id: collectedById,         // Employee ID collecting the payment
    }),
  };

  // Return the Promise for proper handling
  return fetch(`https://api.zenoti.com/v1/invoices/${invoiceId}/payment/custom`, options)
    .then(res => res.json())
    .then(res => {
      console.log(res);  // Log the API response to the console

      // If the custom payment is successfully created, close the invoice
      if (res.error === null) {
        const collectedById = 'b41ef1f0-ba77-4df3-ad4a-c74edb3c0252';   // Employee who collected the payment
        return closeInvoice(invoiceId, collectedById); // Return the Promise from closeInvoice
      } else {
        console.error('Error with custom payment:', res);
        throw new Error('Custom payment failed');
      }
    })
    .catch(err => {
      console.error('Error:', err);
      throw err;
    });
}

// Function to close the invoice
function closeInvoice(invoiceId, closedById) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      is_invoice_closed: true,               // Set to true to close the invoice
      status: 1,                             // Status 1 means Closed
      closed_by_id: closedById              // ID of the employee who closed the invoice
    })
  };

  // Return the Promise for proper handling
  return fetch(`https://api.zenoti.com/v1/invoices/${invoiceId}/close`, options)
    .then(res => res.json())
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(err => {
      console.error('Error:', err);
      throw err;
    });
}

// Success route
router.post("/success", async (req, res) => {
    try {
      // Log PayU response
      console.log(req.body); // Log the response data

      const { status, txnid, amount,productinfo } = req.body;

      if (status === 'success') {
        // Call the function to create the custom payment record in Zenoti
        const customPaymentId = 'cd817708-9de6-4152-9845-23c25b9f8e1b';  // Custom payment ID
        const collectedById = 'b41ef1f0-ba77-4df3-ad4a-c74edb3c0252';   // Employee who collected the payment

        // Process the payment and invoice closure
        makeCustomPayment(txnid, 29500, customPaymentId, collectedById)
          .then(result => {
            // Redirect with both status and invoice status
            res.redirect(`http://localhost:3000/?status=${status}&sisinvoiceid=${result.is_invoice_closed}&productinfo=${productinfo}&amount=${amount}`);
          })
          .catch(error => {
            console.error('Error in background processing:', error);
            //res.redirect(`http://localhost:3000/?status=failure&error_message=${error.message}`);
          });
      } else {
        // If payment wasn't successful, redirect with the status
        //res.redirect(`http://localhost:3000/?status=${status}&error_message=${error_Message}`);
      }
    } catch (error) {
      console.error(error);
     // res.redirect("http://localhost:3000/?status=failure&error_message=Server Error");
    }
});

// Failure route
router.post("/failure", async (req, res) => {
    try {
      // Log PayU response for failure
      console.log(req.body); // Log the response data
      const { status, txnid, error_Message } = req.body;

      // Redirect to the frontend failure page
      res.redirect(`http://localhost:3000/?status=${status}&error_message=${error_Message}`);
    } catch (error) {
      console.error(error);
      res.redirect("http://localhost:3000/?status=failure&error_message=Server Error");
    }
});

module.exports = router;


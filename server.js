const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const port = 5000;

// Middleware to parse the body of the request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Verify the PayU hash
const verifyHash = (paymentData, salt) => {
  const { key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 } = paymentData;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  return hash === paymentData.hash;
};

// Success Route (surl)
app.post('/payment-success', (req, res) => {
  const paymentData = req.body;
  const salt = '0Rd0lVQEvO';  // Replace with your PayU Salt

  if (verifyHash(paymentData, salt)) {
    // Payment is successful
    res.send({ status: 'success', message: 'Payment was successful!' });
  } else {
    // Invalid payment data
    res.send({ status: 'failure', message: 'Payment failed. Please try again.' });
  }
});

// Failure Route (furl)
app.post('/payment-failure', (req, res) => {
  const paymentData = req.body;
  const salt = '0Rd0lVQEvO';  // Replace with your PayU Salt

  if (verifyHash(paymentData, salt)) {
    // Payment failed
    res.send({ status: 'failure', message: 'Payment failed. Please try again.' });
  } else {
    // Invalid payment data
    res.send({ status: 'failure', message: 'Payment failed. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

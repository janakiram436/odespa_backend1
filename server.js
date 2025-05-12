const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const payuRoutes = require("./routes/payuRoutes"); // Import payuRoutes
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse incoming data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// PayU Routes
app.use("/api/payu", payuRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

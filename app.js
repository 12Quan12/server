const express = require("express");
const app = express();

app.use(express.json());
app.use("/product", require("./routes/products"));

module.exports = app;

//import useful module
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const module_companyRouter = require("./routes/company.js");
const module_personnelRouter = require("./routes//personnel.js");
const bodyParser = require("body-parser");

//for use body parser
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json


//connect to mongo database
mongoose.connect(
    "mongodb://localhost:27017/Employees",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

//connect to routers
app.use("/company", module_companyRouter);
app.use("/personnel", module_personnelRouter);


app.listen(3000, function () {
    console.log("server started on port: 3000");
})
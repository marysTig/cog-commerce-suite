const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Passenger needs this
if (typeof(PhusionPassenger) !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

app.listen("passenger");

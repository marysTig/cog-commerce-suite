const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "dist")));

// Express 5 requires named wildcard: {*splat} instead of just *
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

if (typeof(PhusionPassenger) !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

app.listen("passenger");

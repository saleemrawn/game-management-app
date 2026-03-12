const express = require("express");
const app = express();
const path = require("node:path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const PORT = 8080;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Express app listening on port ${PORT}`);
});

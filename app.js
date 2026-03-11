const express = require("express");
const app = express();

const PORT = 8080;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Express app listening on port ${PORT}`);
});

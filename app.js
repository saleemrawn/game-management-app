const express = require("express");
const app = express();
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");
const gamesRouter = require("./routes/gamesRouter");
const platformsRouter = require("./routes/platformsRouter");
const genresRouter = require("./routes/genresRouter");
const modesRouter = require("./routes/modesRouter");
const developersRouter = require("./routes/developersRouter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", indexRouter);
app.use("/games", gamesRouter);
app.use("/platforms", platformsRouter);
app.use("/genres", genresRouter);
app.use("/modes", modesRouter);
app.use("/developers", developersRouter);

const PORT = 8080;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Express app listening on port ${PORT}`);
});

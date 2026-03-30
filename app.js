require("dotenv").config();
const express = require("express");
const ejsLayouts = require("express-ejs-layouts");
const app = express();
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");
const gamesRouter = require("./routes/gamesRouter");
const platformsRouter = require("./routes/platformsRouter");
const genresRouter = require("./routes/genresRouter");
const modesRouter = require("./routes/modesRouter");
const developersRouter = require("./routes/developersRouter");
const errorRouter = require("./routes/errorRouter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(ejsLayouts);
app.use(express.urlencoded({ extended: true }));
app.use("/", indexRouter);
app.use("/games", gamesRouter);
app.use("/platforms", platformsRouter);
app.use("/genres", genresRouter);
app.use("/modes", modesRouter);
app.use("/developers", developersRouter);
app.use("/{*splat}", errorRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.statusCode || 500)
    .render("customError", { title: `${err.statusCode} | ${err.message}`, error: { statusCode: err.statusCode, message: err.message } });
});

const PORT = 8080;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Express app listening on port ${PORT}`);
});

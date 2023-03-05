require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRouter = require("./services/auth/routes.js");
const websitesRouter = require("./services/websites/routes.js");

const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/auth", authRouter);
app.use("/websites", websitesRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true,
  })
  .then(async () => {
    console.log("MongoDB connected");
    await mongoose.connection.syncIndexes().then(() => {
      console.log("Indexes synced");
    });
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error");
    console.log(err);
  });

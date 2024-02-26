#!/usr/bin/env node

const http = require("http");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const { Sequelize } = require("sequelize");

const config = require("../config");
const App = require("../app");

const connectToMongoose = async () => {
  return mongoose.connect(config.mongodb.url);
};

const connectToRedis = () => {
  const redisClient = new Redis(config.redis.port);

  redisClient.on("connect", () => {
    console.info("Successfully connected to Redis");
  });

  redisClient.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  return redisClient;
};

const connectToMySQL = () => {
  const sequelize = new Sequelize(config.mysql.options);

  sequelize
    .authenticate()
    .then(() => {
      console.info("Successfully connected to mySQL");
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });

  return sequelize;
};

const redisClient = connectToRedis();
config.redis.client = redisClient;

const mySQLClient = connectToMySQL();
config.mysql.client = mySQLClient;

/* Logic to start the application */
const app = App(config);
const port = process.env.PORT || "3000";
app.set("port", port);

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? `Pipe ${port}` : `Port  ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

const server = http.createServer(app);
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;

  console.info(`${config.applicationName} listening on ${bind}`);
}
server.on("error", onError);
server.on("listening", onListening);

connectToMongoose()
  .then(() => {
    console.info("Successfully connected to MongoDB");
    server.listen(port);
  })
  .catch((error) => {
    console.error(error);
  });

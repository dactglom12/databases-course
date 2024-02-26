const MongoBackend = require("./services/backend/MongoBackend");
const RedisBackend = require("./services/backend/RedisBackend");
const MysqlBackend = require("./services/backend/MySQLBackend");

async function runMongo() {
  const mongoBackend = new MongoBackend();

  return mongoBackend.max();
}

async function runRedis() {
  const redisBackend = new RedisBackend();

  return redisBackend.max();
}

async function runMysql() {
  const mysqlBackend = new MysqlBackend();

  return mysqlBackend.max();
}

runMysql()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => console.error(err));

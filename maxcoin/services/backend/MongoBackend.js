/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const { MongoClient } = require("mongodb");
const CoinAPI = require("../CoinAPI");

class MongoBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.mongoURL = "mongodb://localhost:37017/maxcoin";
    this.client = null;
    this.collection = {};
  }

  async connect() {
    const mongoClient = new MongoClient(this.mongoURL);

    this.client = await mongoClient.connect();
    this.collection = this.client.db("maxcoin").collection("values");

    return this.client;
  }

  async disconnect() {
    if (!this.client) return false;

    return this.client.close();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const documents = [];

    Object.entries(data.bpi).forEach(([date, value]) => {
      documents.push({
        date,
        value,
      });
    });

    return this.collection.insertMany(documents);
  }

  async getMax() {
    return this.collection.findOne({}, { sort: { value: 1 } });
  }

  async max() {
    console.info("Connection to MongoDB");
    console.time("mongodb-connect");
    const client = await this.connect();

    if (client) {
      console.info("Client has been connected");
    } else {
      throw new Error("Connecting to MongoDB failed");
    }

    console.timeEnd("mongodb-connect");

    console.info("Inserting into MongoDB");
    console.time("mongodb-insert");

    await this.insert();

    console.timeEnd("mongodb-insert");

    console.info("Querying mongoDB");
    console.time("mongodb-query");

    const doc = await this.getMax();

    console.timeEnd("mongodb-query");

    console.info("Disconnecting from MongoDB");
    console.time("mongodb-disconnect");

    await this.disconnect();

    console.timeEnd("mongodb-disconnect");

    return { date: doc.date, value: doc.value };
  }
}

module.exports = MongoBackend;

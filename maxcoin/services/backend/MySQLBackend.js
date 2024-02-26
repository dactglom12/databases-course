/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const mysql = require("mysql2/promise");
const CoinAPI = require("../CoinAPI");

class MySQLBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: "localhost",
      port: 3406,
      user: "root",
      password: "password",
      database: "maxcoin",
    });

    return this.connection;
  }

  async disconnect() {
    return this.connection.end();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const sql = "INSERT INTO coinvalues (valuedate, coinvalue) VALUES ?";
    const values = [];

    Object.entries(data.bpi).forEach(([date, value]) => {
      values.push([date, value]);
    });

    return this.connection.query(sql, [values]);
  }

  async getMax() {
    return this.connection.query(
      "SELECT * FROM coinvalues ORDER BY coinvalue DESC LIMIT 0,1"
    );
  }

  async max() {
    const connection = await this.connect();

    if (!connection) {
      throw new Error("Failed to connect to mySQL");
    } else {
      console.info("Connected successfully");
    }

    const insertResult = await this.insert();

    console.info(`Inserted ${insertResult[0].affectedRows} rows`);

    const result = await this.getMax();

    console.log(result);
    const row = result[0][0];

    await this.disconnect();

    return row;
  }
}

module.exports = MySQLBackend;

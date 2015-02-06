var config = {};

config.MONGO_MAIN = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || "mongodb://localhost/asp";
config.MONGO_TEST = process.env.MONGO_TEST || "mongodb://localhost/asp-test";

module.exports = config;

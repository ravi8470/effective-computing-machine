const mongoose = require("mongoose");
// mongoose.set('debug',true)
const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(process.env.DB_CONN_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to DB !!");
  } catch (e) {
    console.log(e);
  }
};

module.exports = InitiateMongoServer;
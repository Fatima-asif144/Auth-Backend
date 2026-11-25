const mongoose = require("mongoose");

// We keep the connection promise so that Vercel (serverless) reuses
// one connection instead of opening a new one on every request.
let connectionPromise = null;

const connectDB = () => {
  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error("MONGO_URI is missing in the environment variables"));
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = null; // allow a retry on the next request
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;

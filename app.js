const os = require('os');
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', async (req, resp) => {

  const networkInterfaces = os.networkInterfaces();
  const ipAddress = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface.family === 'IPv4' && !iface.internal);
  const myIp = ipAddress.address;


  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('SSO');
  const collection = db.collection('user');
  const query = { 'myIp': `${myIp}` };
  // Find one document that matches the query
  let result = await collection.find(query).toArray();

  if (result) {
    resp.render('profile')
  } else {
    resp.render('login')
  }
})

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


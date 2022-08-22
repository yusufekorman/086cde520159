const express = require("express");
const app = express();
const { config } = require('dotenv');
var cors = require("cors");
const db = require("quick.db");
var bodyParser = require("body-parser");
var path = require("path");

config();
const port = process.env.PORT || 80;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./public/index.html"));
});

app.get("/search", (req, res) => {
  res.sendFile(path.resolve("./public/search.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.resolve("./public/admin.html"));
});

app.post("/api/newItem", (req, res) => {
  const adminPassword = req.body.adminPassword;
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    db.set(`item_${req.body.key}`, {
      product_name: req.body.name,
      product_image: req.body.image,
      key: req.body.key,
      ebay_href: req.body.ebay_href,
    });
  
    res.json({data: db.get(`item_${req.body.key}`), statusCode: 2});
  } else {
    res.json({ statusCode: 1, message: "You is not authorized." });
  }
});

app.post("/api/delItem", (req, res) => {
  const adminPassword = req.body.adminPassword;
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    db.delete(`item_${req.body.key}`);
  
    res.json({ statusCode: 2 });
  } else {
    res.json({ statusCode: 1, message: "You is not authorized." });
  }
});

app.get("/api/products", (req, res) => {
  res.json({products: db.fetchAll().map(f => JSON.parse(f.data))});
});

app.post("/api/search", (req, res) => {
  const q = req.body.q;
  const item = db.has(`item_${q}`) ? {data: db.get(`item_${q}`), statusCode: 2} : {statusCode: 1};

  res.json(item)
});

app.listen(port, () => {
  console.log(`Application Started.`);
  console.log(`Port ${port}`);
});

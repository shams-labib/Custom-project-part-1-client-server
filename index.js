const express = require("express");
const cors = require("cors");
const port = 3000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const admin = require("firebase-admin");

const serviceAccount = require("./firebaseToken.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyFirebaseToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "Unauthorize access" });
  }

  const token = authorization.split(" ")[1];

  next();
};

// Custom-project-part-1
// R9lkVZ3cpw2mwQRY
const uri =
  "mongodb+srv://Custom-project-part-1:R9lkVZ3cpw2mwQRY@cluster0.gs1mqwb.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("Project-1");
    const productsCollection = db.collection("products");

    app.post("/products", async (req, res) => {
      const newUsers = req.body;
      const result = await productsCollection.insertOne(newUsers);
      res.send(result);
    });

    app.get("/products", verifyFirebaseToken, async (req, res) => {
      const cursor = await productsCollection.find().toArray();
      res.send(cursor);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(filter);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch {}
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Mal is running");
});

app.listen(port, () => {
  console.log(`This is port ${port}`);
});

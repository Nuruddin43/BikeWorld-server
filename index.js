const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const port = process.env.PORT || 5000
const app = express()

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zo5kz.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

async function run() {
  try {
    await client.connect()

    const productCollection = client.db("ctgBike").collection("products")
    const orderCollection = client.db("ctgBike").collection("order")
    const userCollection = client.db("ctgBike").collection("users")

    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray()
      res.send(users)
    })

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email
      const user = req.body
      const filter = { email: email }

      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await userCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.get("/product", async (req, res) => {
      const query = {}
      const cursor = productCollection.find(query)
      const products = await cursor.toArray()
      res.send(products)
    })

    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const product = await productCollection.findOne(query)
      res.send(product)
    })

    // Order
    app.post("/order", async (req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })

    app.get("/order", async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const cursor = orderCollection.find(query)
      const orders = await cursor.toArray()
      res.send(orders)
    })
  } finally {
  }
}
run().catch(console.dir)

app.get("/", (req, res) => {
  res.send("Running CTGBIKE World")
})

app.listen(port, () => {
  console.log("Listening to port 5000")
})

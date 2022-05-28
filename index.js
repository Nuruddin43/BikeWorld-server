const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const port = process.env.PORT || 5000
const app = express()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

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
    const reviewCollection = client.db("ctgBike").collection("review")
    const newProductCollection = client.db("ctgBike").collection("newProduct")

    app.post("/create-payment-intent", async (req, res) => {
      const product = req.body
      const price = product.price
      const amount = price * 100
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      })
      res.send({
        clientSecret: paymentIntent.client_secret,
      })
    })

    // NEW PRODUCT API
    app.get("/newProduct", async (req, res) => {
      const query = {}
      const cursor = newProductCollection.find(query)
      const newProducts = await cursor.toArray()
      res.send(newProducts)
    })
    app.post("/newProduct", async (req, res) => {
      const newProduct = req.body
      const result = await newProductCollection.insertOne(newProduct)
      res.send(result)
    })
    app.delete("/newProduct/:id", async (req, res) => {
      const id = req.params.id.trim()
      const query = { _id: ObjectId(id) }
      const result = await newProductCollection.deleteOne(query)
      res.send(result)
    })

    // Review

    app.post("/review", async (req, res) => {
      const review = req.body
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })

    app.get("/review", async (req, res) => {
      const query = {}
      const cursor = reviewCollection.find(query)
      const reviews = await cursor.toArray()
      res.send(reviews)
    })

    // GET ALL USERS
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray()
      res.send(users)
    })

    // Make Admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email
      const filter = { email: email }
      const updateDoc = {
        $set: { role: "admin" },
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // GET ADMIN BY EMAIL

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email
      const user = await userCollection.findOne({ email: email })
      const isAdmin = user.role === "admin"
      res.send({ admin: isAdmin })
    })

    // PUT USERS API
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
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id.trim()
      const query = { _id: ObjectId(id) }
      const result = await productCollection.deleteOne(query)
      res.send(result)
    })
    // API ORDER BY ID
    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id.trim()
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
      const orders = await orderCollection.find(query).toArray()
      res.send(orders)
    })
    // app.delete("/order/:id", async (req, res) => {
    //   const id = req.params.id.trim()
    //   const query = { _id: ObjectId(id) }
    //   const order = await orderCollection.deleteOne(query)
    //   res.send(order)
    // })
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id.trim()
      const query = { _id: ObjectId(id) }
      const order = await orderCollection.findOne(query)
      res.send(order)
    })
    app.get("/order", async (req, res) => {
      const query = {}
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

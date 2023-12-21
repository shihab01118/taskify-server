const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jcpqyde.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const taskCollection = client.db("taskifyDB").collection("tasks");

    // get task by user email
    app.get("/tasks/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await taskCollection
          .find({ requester_email: email })
          .toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // api to post a task
    app.post("/tasks", async (req, res) => {
      try {
        const newTask = req.body;
        const result = await taskCollection.insertOne(newTask);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // api to update status of a task
    app.patch("/tasks/:id", async (req, res) => {
      try {
        const taskId = req.params.id;
        const { status } = req.body;
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { status: status } }
        );
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // api to delete a task
    app.delete("/tasks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await taskCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("taskify is waiting...");
});

app.listen(port, () => {
  console.log(`taskify server is running on port: ${port}`);
});

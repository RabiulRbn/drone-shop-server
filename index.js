const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2trxm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect()
        const database = client.db('droneShop')
        const servicesCollection = database.collection('services');
        const ordersCollection = database.collection('orders');
        const userReviewsCollection = database.collection('userReviewsCollection');
        const adminCollection = database.collection('adminCollection');
        const usersCollection = database.collection('users');


        // GET API
        app.get('/services', async (req, res) => {
            
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        // GET API
        app.get('/service', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api',service);


            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result)
            

        });

        // GET Single Service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        });

        

        app.post('/addOrder', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);


            const result = await ordersCollection.insertOne(service);
            console.log(result);
            res.json(result);

        })


        app.get('/addOrder', (req, res) => {
            ordersCollection.find({})
                .toArray((err, documents) => {
                    // console.log(documents);
                    res.send(documents);
                })
        })







        app.post('/usersReview', (req, res) => {
            const newReview = req.body;
            console.log('Adding new review', newReview);
            userReviewsCollection.insertOne(newReview)
                .then(result => {
                    // console.log('Inserted count', result.insertedCount);
                    res.send(result.insertedCount > 0)
                })
        })

        app.get('/reviews', (req, res) => {
            userReviewsCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });

        
        app.get('/orderList', (req, res) => {
            ordersCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });


        

        

        app.get('/orderedProduct', (req, res) => {
            ordersCollection.find({})
                .toArray((err, documents) => {
                    // console.log(documents);
                    res.send(documents);
                })
        })

        

        app.delete('/delete/:id', (req, res) => {
            const id = ObjectId(req.params.id);
            servicesCollection.findOneAndDelete({ _id: id })
                .then((documents) => res.send(documents.value));
        })







        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })



        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });


        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin',  async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
             res.json(result);
                
           
        })



    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Drone-Shop Server');
});

app.listen(port, () => {
    console.log('Running drone-shop Server on port', port);
})

var express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const port =  process.env.PORT||6700;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const cors =require('cors');
// To receive data from form
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

// const mongourl = "mongodb://localhost:27017";
const mongourl = "mongodb+srv://gauravcom:gupta123@cluster0.wzm9s.mongodb.net/zomato?retryWrites=true&w=majority"
let db;

// get
app.get('/',(req,res) => {
    res.send("Welcome to my API")
})

// Cuisines
app.get('/cuisine',(req,res) => {
    db.collection('cuisine').find().toArray((err, result)=>{
        if(err) throw err;
        res.send(result)
    });
})

// Location
app.get('/location',(req,res) => {
    db.collection('location').find().toArray((err, result)=>{
        if(err) throw err;
        res.send(result)
    });
})

// Restaurants
app.get('/restaurants',(req,res) => {
    db.collection('restaurants').find().toArray((err, result)=>{
        if(err) throw err;
        res.send(result)

    });
})

// query example
app.get('/restaurant',(req,res) =>{
    var query = {}
    if(req.query.stateId){
        query ={state_id:Number(req.query.stateId)}
    }else if(req.query.mealtype_id){
        query ={"mealTypes.mealtype_id":Number(req.query.mealtype_id)}
    }
    db.collection('restaurants').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})


// Filter Api 
// http://localhost:8210/filter/1?lcost=400&hcost=600

app.get('/filter/:mealType',(req,res) => {
    var sort = {cost:1}
    var skip = 0;
    var limit = 100000000000;
    if(req.query.sortkey){
        sort ={cost:req.query.sortkey}
    }
    if(req.query.skip && req.query.limit){
        skip = Number(req.query.skip);
        limit = Number(req.query.limit);
    }
    var mealType =req.params.mealType;
    var query = {"mealTypes.mealtype_id":Number(mealType)};
    if(req.query.cuisine && req.query.lcost && req.query.hcost ){
        query={
            $and:[{cost:{$gt:Number(req.query.lcost), $lt:Number(req.query.hcost)}}],
            "Cuisines.cuisine_id":Number(req.query.cuisine),
            "mealTypes.mealtype_id":Number(mealType)
        }
    }
    else if(req.query.cuisine){
        query = {"maelTypes.mealtype_id":mealType, "Cuisines.cuisine_id":req.query.cuisine}
    }
    else if(req.query.lcost && req.query.hcost){
            var lcost = Number(req.query.lcost);
            var hcost = Number(req.query.hcost);
            query ={$and:[{cost:{$gt:lcost, $lt:hcost}}],"mealTypes.mealtype_id":Number(mealType)}
            }
    db.collection('restaurants').find(query).sort(sort).skip(skip).limit(limit).toArray((err, result)=>{
        if(err) throw err;
        res.send(result)
    });
})


// List all QuickSearches
app.get('/quicksearch',(req,res) => {
    db.collection('mealtype').find().toArray((err, result)=>{
        if(err) throw err;
        res.send(result)
    });
})

// Restaurants Details
app.get('/details/:id',(req,res) => {
    var id = req.params.id
    db.collection('restaurants').find({restaurant_id:Number(id)}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// menu Details on basis for restaurant
app.get('/menu/:id',(req,res) => {
    var id = req.params.id
    console.log(id)
    db.collection('menu').find({restaurant_id:Number(id)}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

app.post('/menuItem',(req,res) => {
    console.log(req.body)
    db.collection('menu').find({menu_id:{$in:req.body}}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// Place Order
app.post('/placeOrder', (req,res)=>{
    console.log(req.body)
    db.collection('orders').find().toArray((err,result)=>{
        if(err) throw err;
        res.send('Order Placed')
    })
})

// View Orders
app.get('/viewOrder', (req,res)=>{
    var query = {}
    if(req.query.email){
        query = {email:req.query.email}
    }
    db.collection('orders').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

app.get('/viewOrder/:id', (req,res)=>{
    var id = mongo.ObjectId(req.params.id);
    db.collection('orders').find({_id:id}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// Delete Order
app.delete('/deleteOrder', (req,res)=>{
    db.collection('orders').remove({},(err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// Update Order
app.put('/updateStatus/:id', (req,res)=>{
    var id = mongo.ObjectId(req.params.id);
    var status = 'Pending';
    var statusVal = 2
    if(req.query.status){
        statusVal = Number(req.query.status)
        if(statusVal == 1){
            status = 'Accepted'
        }else if(statusVal == 0){
            status = 'Rejected'
        }else{
            status = 'Pending'
        }
    }
    db.collection('orders').updateOne(
                {_id:id},
                {
                    $set:{
                       "status": status
                    }
                }, (err,result) => {
                    if(err) throw err;
                    res.send(`Your order status is ${status}`)
                }
            )
})



MongoClient.connect(mongourl, (err,client) => {
    if (err) console.log("Error while connecting...")
    db = client.db('zomato')
    app.listen(port, ()=>{
        console.log(`listening on port number ${port}`)
    });
})





// const app = express();
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv')
// dotenv.config()
// const port =  process.env.PORT||6700;
// // const mongoose = require('mongoose');
// const mongo = require('mongodb');
// const MongoClient = mongo.MongoClient;
// const cors = require('cors');
// // to recive data from form
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(bodyParser.json());
// app.use((cors))

// // const mongourl = "mongodb://localhost:27017";
// const mongourl = "mongodb+srv://gaurav:grkml786786@cluster0.wzm9s.mongodb.net/zomato?retryWrites=true&w=majority";
// var db;
// //get
// app.get('/', (req,res) => {
//     res.send("Welcome to my Node Api.")
// })

// // List all cities
// app.get('/location', (req,res) => {
//     db.collection('location').find().toArray((err, result)=>{
//         if (err) throw err;
//         res.send(result);
//     })
// })

// // List all restaurants
// app.get('/restaurants', (req,res) => {
//     db.collection('restaurants').find().toArray((err, result)=>{
//         if (err) throw err;
//         res.send(result);
//     })
// })



// // query example
// app.get('/restaurant',(req,res) =>{
//     var query = {}
//     if(req.query.stateId){
//         query = {city:req.query.stateId}
//         console.log(query)
//     }else if(req.query.mealtype_id){
//         query = {"mealtypes.mealtype_id":Number(req.query.mealtype)}
//     }
//     db.collection('restaurents').find(query).toArray((err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })


// // Filter Api
// //(http://localhost:8210/filter/1?lcost=500&hcost=600)
// app.get('/filter/:mealtype', (req, res) => {
//     var sort = {cost:1}
//     var skip = 0;
//     var limit = 100000000;
//     if(req.query.sortkey){
//         sort = {cost:req.query.sortkey}
//     }
//     if(req.query.skip && req.query.limit){
//         skip = Number(req.query.skip);
//         limit = Number(req.query.limit);
//     }
//     var mealtype = req.params.mealtype;
//     var query = {"type.mealtype":mealype};
//     if(req.query.cuisine && req.query.lcost && req.query.hcost){
//         query={
//             $and:[{cost:{$gt:Number(req.query.lcost),
//             $lt:Number(req.query.hcost)}}],
//             "cuisine.cuisine_id":Number(req.query.cuisine),
//             "mealTypes.mealtype_id":Number(mealType)
//         }
//     }
//     else if(req.query.cuisine){
//         query = {"mealTypes.mealtype_id":mealType,"cuisines.cuisine_id":Number(req.query.cuisine) }
//     //    query = {"type.mealtype":mealType,"Cuisine.cuisine":req.query.cuisine}
//     }
//     else if(req.query.lcost && req.query.hcost){
//         var lcost = Number(req.query.lcost);
//         var hcost = Number(req.query.hcost);
//         query ={$and:[{cost:{$gt:lcost, $lt:hcost}}], "mealTypes.mealtype":Numbermealtype}
//     }
//     db.collection('restaurants',).find(query).sort(sort).skip(skip).limit(limit).toArray((err,result)=>{
//         if (err) throw err;
//         res.send(result);
//     })
// })

// // List All Quicksearch
// app.get('/quicksearch', (req,res) => {
//     db.collection('mealType').find().toArray((err, result)=>{
//         if (err) throw err;
//         res.send(result);
//     })
// })

// app.get('/cuisine', (req,res) => {
//     db.collection('cuisine').find().toArray((err, result)=>{
//         if (err) throw err;
//         res.send(result);
//     })
// })

// // Restaurants Details
// app.get('/details/:id',(req,res) => {
//     var id = req.params.id
//     db.collection('restaurants').find({restaurant_id:Number(id)}).toArray((err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// // place order 
// app.post('/placeOrder',(req,res) => {
//     console.log(req.body);
//     db.collection('orders').insert(req.body,(err,result) => {
//         if(err) throw err;
//         res.send("Order Placed")
//     })
// })

// // View Orders
// app.get('/viewOrder',(req,res) => {
//     var query = {}
//     if(req.query.email){
//         query = {email:req.query.email}
//     }
//     db.collection('orders').find(query).toArray((err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// app.get('/viewOrder/:id',(req,res) => {
//     var id = mongo.ObjectId(req.params.id);
//     db.collection('orders').find({_id: id}).toArray((err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// // Delete orders
// app.delete('/deleteOrder',(req,res) => {
//     db.collection('orders').remove({},(err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// app.put('/updateOrder/:id',(req,res) => {
//     var id = Number(req.params.id);
//     var status = req.body.status?req.body.status:"Pending"
//     db.collection('orders').updateOne(
//         {id:id},
//         {
//             $set:{
//                 "date":req.body.date,
//                 "bank_status":req.body.bank_status,
//                 "bank":req.body.bank,
//                 "status":status
//             }
//         }
//     )
//     res.send('data updated')
// })

// app.put('/updateStatus/:id',(req,res) => {
//     var id = mongo.ObjectId(req.params.id);
//     var status = 'Pending';
//     var statuVal = 2
//     if(req.query.statuVal){
//         statuVal = Number(req.query.statuVal)
//         if(statuVal == 1){
//             status = 'Accepted'
//         }else if (statuVal == 0){
//             status = 'Rejected'
//         }else{
//             status = 'Pending'
//         }
//     }
//     db.collection('orders').updateOne(
//         {_id:id},
//         {
//             $set:{
//                "status": status
//             }
//         }, (err,result) => {
//             if(err) throw err;
//             res.send(`Your order status is ${status}`)
//         }
//     )
// })

// MongoClient.connect(mongourl, (err,client) => {
//     if(err) console.log("Error While Connecting");
//     db = client.db('zomato');
//     app.listen(port,()=>{
//         console.log(`listening on port no ${port}`)
//     });
// })












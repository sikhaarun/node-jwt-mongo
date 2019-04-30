//variable declarations
const express = require('express')
const mongoose=require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
//use express 
let app = express();
const _appConfig=require('./config.js');
//establish mongoDB connection 
mongoose.connect('mongodb://'+_appConfig.mongoUsername+':'+_appConfig.mongoPwd+'@cluster0-shard-00-00-rrjkn.mongodb.net:27017,cluster0-shard-00-01-rrjkn.mongodb.net:27017,cluster0-shard-00-02-rrjkn.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true',{useNewUrlParser: true});

//body parser to get json data from the request 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//mongoDB models
let userModel = mongoose.model('users', { firstname: String, lastname:String,username:String,password:String, age:Number,gender:String,address:String  });



////////////////////////////////////////
//api calls
////////////////////////////////////////

//api to add new user to UserModel
app.post('/api/addUser',(req,res)=>{

  try
  {
    let user = new userModel(req.body);
    user.save((err)=>{
      if(!err)
      {
        res.send("New User Created !!!")
      }
      else
        res.send("err :  " + err)
    })
  }
  catch(err)
  {
    console.log(err)
    res.send(err);
  }
})


//login api
app.post('/login',(req,res)=>{
  try
  {
    userModel.find(req.body,function (err, users) {//i is for case insensitive
      if (err){ 
        return res.send(err)
      }
      else
      {
        if(users.length>0)
        {
            jwt.sign(req.body, 'privateKey',(err, token) =>{
               console.log(token);
               res.send(token)
            });
        }
      }
      
    });
  }
  catch(err)
  {
    res.send(err);
  }
})




//api to verify login token
app.post('/api/verifyToken',(req,res)=>{
  try
  {
    if(verifyToken(req.headers.token)!="Invalid Token")
    {
      res.send("Valid Token")

    }
    else
    {
      res.send("Invalid Token !!! ")
    }
  
  }
  catch(err)
  {
    res.send(err)
  }
})



//api to get a specific user details
app.post('/api/getUserDetails',(req,res)=>{
  try
  {
    userModel.find(req.body,(err,data)=>{
      console.log(data)
     res.send(data)
    })
  }
  catch(err)
  {
    
  }
})





////////////////////////////////////////
//function definitions
////////////////////////////////////////

let verifyToken = (token)=>{
  try
  {
    let decoded = jwt.verify(token, 'privateKey');
    console.log('after decode '+ JSON.stringify(decoded))
    return decoded;
  }
  catch(err)
  { 
    return "Invalid Token";

  }
}



//listen the app to a port to run the application 
app.listen(process.env.PORT || _appConfig.port, function () {
  console.log(' web server listening on port 3002')
})
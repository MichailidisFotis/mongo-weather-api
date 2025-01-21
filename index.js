import express from "express"
import session from "express-session"
import { fileURLToPath } from 'url';
import {dirname} from "path"
import mongoose from "mongoose";    
import bodyParser from "body-parser";
import dotenv from "dotenv"
import cors from "cors"

import MongoStore from 'connect-mongo';

import requireLogin from "./middlewares/requireLogin.js";

import usersRouter from "./routes/users/users.js"
import weatherRouter from "./routes/weather/weather.js"


const app =express();
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 5000
const db_link =  process.env.db_link

var jsonParser = bodyParser.json();





app.use(cors({  
  origin: 'http://localhost:4200', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true 

}));

// app.use(cors());


app.use(bodyParser.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // sameSite:'none',
      secure: false,
      maxAge: 269999999999,
    },

    store: MongoStore.create({
      mongoUrl:db_link
    })
  })
);



mongoose.connect(db_link,{})
.then((res)=>console.log("Database Connected"))
.catch((err) =>console.error(err))


app.use("/users" , usersRouter);
app.use("/weather" , weatherRouter);
app.get("/" ,(req , res)=>{
    res.send('API WORKS');
});



app.listen(PORT , () =>console.log('Listening to PORT: '+PORT))
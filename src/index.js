import mongoose from "mongoose"
import { DB_NAME } from "./constants.js"
import connectDB from "./db/index.js"
import dotenv from "dotenv"
import {app} from './app.js'
dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`sever running on ${process.env.PORT}`)
    })
})
.catch((err=>{
    console.log(`Mongo Db connection Failed`,err)
}))



// import express from express
// const app=express()
// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR:",error);
//             throw err
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is running on Port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error(error)
//         throw err
//     }
// })()
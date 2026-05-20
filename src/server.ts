import express, { type Application } from 'express'
import config from './config'
const app:Application=express()
const port=config.port;



// here we have to start te server 
app.listen(port,()=>{
    console.log(`the server is running on port :${port}`)
})
const express = require("express");
const cors = require("cors");
const {connection} = require("./config/db");
const { allRouter } = require("./Route/AllRoutes");
const PORT = process.env.PORT || 7070;

const app = express();

app.get("/",(req,res)=>{
    res.send("Welcome to the Backend page.")
})
app.use(express.json());
app.use(cors())
app.use("/api",allRouter);

app.listen(PORT,async()=>{
    try {
        console.log("Connecting to DB");
        await connection;
        console.log("Connected to DB");
        console.log("Server is running at 8080");
    } catch (error) {
        console.log(error);
    }
})


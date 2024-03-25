const express = require('express');
const mainRouter = require("./src/routes/index")
const app = express();
const cors = require('cors')

const PORT = 3000 
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send("Hey! I've completed the backend part of KatyM (a Paytm clone) today. Now, I'm diving into the frontend development. Stay tuned for updates on this exciting project!");
})

app.use("/api/v1",mainRouter)

app.listen(PORT,()=> {console.log( ` server running on : http://localhost:${PORT}`)})



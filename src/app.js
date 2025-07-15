const express = require("express");

const app = express();
const PORT = 3000;
app.use("/test",(req, res) => {
  res.send("Hello from the server");
});
app.use("/hi",(req,res)=>{
    res.send("hi from the server")
})
app.use("/",(req,res)=>{
    res.send("Hello from the server home")
})



app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

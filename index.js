const express = require("express");
const FileUpload = require("express-fileupload");
const postIdentity = require("./services/postIdentity");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(FileUpload());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send(`Hello World`);
})

app.post("/identity", postIdentity)


app.listen(port, () => {
    console.log(`Server listening on ${port}`);
})
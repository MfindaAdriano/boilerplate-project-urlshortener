//configure .env file
require("dotenv").config();
//importing modules
const express = require("express");
const validUrl = require("valid-url");
const shortId = require("shortid");
const mongoose = require("mongoose");

let ShortenerModel = null;
//Database handling
try{
    //connect to the database
    mongoose.connect(process.env.DB_HOST);
    console.log("DB connected successfully!");

    //create a mongoose Schema
    const ShortenerSchema = new mongoose.Schema({original_url: String, short_url: String});

    //create Shortener Mode
    ShortenerModel = mongoose.model("shortmodels", ShortenerSchema);

}catch(error){
    console.warn(`Failed to connect to the DB: ${error}`)
}

async function updateUrlData (data, model) {
    const input = new model(data); 
    let outputMessage;

    await input.save()
}
//Database handling


//function to validate the original url provided by the user
function checkUrlValid(url){
    //url = "http://localhost:3000";

    const isHttps = validUrl.isHttpsUri(url);
    const isHttp = validUrl.isHttpUri(url);

    //if the provided url is a HTTP or HTTPS valid uri
    if(typeof isHttps === "string" || typeof isHttp === "string"
    ) return url;

    //else return null;
    return null;
}



//criando app and initiate it calling the listen method and using PORT defined in .env
const app = express();
const port = process.env.PORT;

app.listen(port, () => console.log(`The Application is listen on port ${port}`));

//Some express configurations
app.use(express.urlencoded({extended: false}));
app.use(express.json()); 

app.get("/", (req, res) => {
    //res.send("You are In there");
    res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", async (req, res) => {
    console.log(`url: ${req.url}\nBody: ${JSON.stringify(req.body)}`);

    const originalUrl = checkUrlValid(req.body.url);
    
    if(req.body.url !== ""){
        //if the url is valid
        //check if it is already on the DB
        const urlInDB = await ShortenerModel.findOne({original_url: originalUrl});

        //if url is already in the DB
        if(urlInDB){
            res.send({original_url: urlInDB.original_url, short_url: urlInDB.short_url});
        }else{
            if(typeof originalUrl === "string"){
                const urlData = {original_url: originalUrl, short_url: shortId.generate()};
        
                //write to the DB
                let responseDB;
                updateUrlData(urlData, ShortenerModel)
                    .then(() => console.log("DB Operation Status: Success" ))
                    .catch((error) => console.log("DB Operation Status: Failure\n\t" + responseDB))
    
                
                //render urlData object which contains the original and short url.
                res.send(urlData);
            }else{
                res.send({error: "invalid url"});
            }
        }
    }
    
    //res.send({urlData});
}); //end of the post method to save shorten url

app.get("/api/shorturl/:short_url?", async (req, res) => {
    const shortUrl = req.params.short_url;

    //check if the shortUrl does exist in the DB
    const shortInDB = await ShortenerModel.findOne({short_url: shortUrl});

    //if it does exist
    if(shortInDB){
        console.log(shortInDB.original_url);

        //redirect to the original URL found in the DB
        res.redirect(shortInDB.original_url);
        
    }else console.log("Not in DB, I am sorry!");
    
})






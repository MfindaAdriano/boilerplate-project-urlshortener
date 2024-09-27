require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

//use body parsing middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url;
  
  dns.lookup(url, 4, (error, family) => {
    if(error) console.error("Mfinda, check the error: \n" + error);

    //if everything is alright
    console.log(url, family);
  });
  res.json({"original_url": url, "short_url": 1});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

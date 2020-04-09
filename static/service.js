const path = require('path');
const express = require('express');

const app = express();

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'moduleTest.html'));
});

app.use(express.static(__dirname + '/js'));

app.listen('3000','0.0.0.0',function(err){
    if(err){
        console.log(err);
        return;
    }
    console.log('Listening at http://0.0.0.0:3000');
});
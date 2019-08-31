const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();


//Setup the view Engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//Setup the static assets directories
app.use(express.static('images'));
app.use(express.static('css'));
app.use(express.static('views'));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(morgan('common'));
app.listen(8080);

const MongoClient = mongodb.MongoClient;
const url = "mongodb://192.168.1.107:27017/";


var db;
var idDB = [];

MongoClient.connect(url, { useNewUrlParser: true },
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        }
        else {
            console.log("Connected successfully to server");
            db = client.db("week6");
        }
    });


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});
app.get('/index', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});
app.get('/newTask', function (req, res) {
    res.sendFile(__dirname + '/views/newTask.html');
});
app.post('/data', function (req, res) {
    let taskDetails = req.body;
    
    checkUnique(getNewId());

    function checkUnique(generatedID){
        let newID = generatedID;

        while(idDB.includes(newID)){
            if(idDB.includes(newID)){
                newID = getNewID();
            };
        };

        idDB.push(newID);
    };

    let assignedID = idDB[idDB.length - 1];

    let inputStatus = req.body.selectStatus;

    db.collection('taskDB').insertOne({ id: assignedID, name: taskDetails.taskName,
    assigned: taskDetails.tassigned, dueDate: taskDetails.taskDue, 
    status: inputStatus, description: taskDetails.taskDesc});

    res.redirect('/listTasks');
});
app.get('/listTasks', function (req, res) {
    db.collection('taskDB').find({}).toArray(function (err, data)
    {
        res.render('listTasks.html', {taskDbs: data});
    });
});
app.get('/updateTask', function(req, res){
    res.sendFile(__dirname + '/views/updateTask.html');
});
app.post('/updateTaskData', function(req, res){
    let taskDetails = req.body;
    let taskNo = parseInt(taskDetails.taskID);

    let filter = { id: taskNo };

    /*
    let answer = document.getElementById("selectStatus");
    let updatedStatus = answer.options[express.selectedIndex].text;
    console.log(updatedStatus);
    */
    //let theUpdate = { $set: { status: taskDetails.newTaskStatus }};
    let updatedStatus = req.body.selectStatus2;
    let theUpdate = { $set: { status: updatedStatus }};
    db.collection('taskDB').updateOne(filter, theUpdate, {upsert: false}, 
        function(err, result){
    });

    res.redirect('/listTasks');
});
app.get('/deleteTask', function(req, res){
    res.sendFile(__dirname + '/views/deleteTask.html')
});
app.post('/deleteTaskData', function (req, res) {
    let taskDetails = req.body;
    let taskNo = parseInt(taskDetails.taskID);
    let filter = { id: taskNo };
    db.collection('taskDB').deleteOne(filter);
    res.redirect('/listTasks');
});
app.get('/clearCompleted', function(req, res){
    db.collection('taskDB').deleteMany( {status: 'Complete'}, 
    function (err, obj){
        console.log(obj.result);
    });

    res.redirect('/listTasks');
});

function getNewId() {
    return (Math.floor(100000 + Math.random() * 900000));
}
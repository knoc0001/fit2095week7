const express = require('express');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

let Task = require('./models/task');
let Developer = require('./models/developer');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static('images'));
app.use(express.static('css'));
app.use(express.static('views'));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(morgan('common'));

const url = "mongodb://0.0.0.0:27017/Week7";
var idDB = [];

mongoose.connect(url, function (err) {
        if (err) {
            console.log('Error in Mongoose connection.');
            throw err;
        }
            
        console.log("Connected successfully to server");    
        let dev1 = new Developer({
            devName: {
                firstName: 'Reika',
                lastName: 'Kisshouin'
            },
            devLevel: 'BEGINNER',
            devAddress: {
                state: 'Kenkyo',
                suburb: 'Kenjitsu',
                street: 'O Motto ni Ikite',
                unit: 'Orimasu'
            }
        });

        dev1.save(function(err){
            if (err) throw err;

            console.log('Dev successfully added to DB');

            var task1 = new Task({
                taskID: getNewId(),
                tName: 'Update Novel',
                assignedTo: dev1._id,
                tDue: new Date(),
                tStatus: 'In Progress',
                tDesc: 'TBA'
            });

            task1.save(function(err){
                if(err) throw err;
                console.log('Task1 successfully added to DB');
            });
        });
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
    idDB.push(getNewId());
    let assignedID = idDB[idDB.length - 1];
    let inputStatus = req.body.selectStatus;
    console.log(`TASK DATE ${taskDetails.taskDue} ~~`);
    new Task({
        taskID: assignedID,
        tName: taskDetails.taskName,
        assignedTo: mongoose.Types.ObjectId(taskDetails.tassigned),
        tDue: new Date(taskDetails.taskDue),
        tStatus: inputStatus,
        tDesc: taskDetails.taskDesc
    }).save(function(err){
        if (err) throw err;

        console.log('Task Successfully Inserted to DB.');
    });

    res.redirect('/listTasks');
});
app.get('/listTasks', function (req, res) {
    Task.find().exec(function(err,data){
        res.render('listTasks.html', {taskDbs:data});
        //res.send(data);
    });
});
app.get('/updateTask', function(req, res){
    res.sendFile(__dirname + '/views/updateTask.html');
});
app.post('/updateTaskData', function(req, res){
    let taskDetails = req.body;
    let taskNo = parseInt(taskDetails.taskID);

    let updatedStatus = req.body.selectStatus2;

    Task.updateOne({'taskID': taskNo}, { $set: {
        'tStatus': updatedStatus } }, function(err, doc){
            console.log(doc);
    });

    res.redirect('/listTasks');
});
app.get('/deleteTask', function(req, res){
    res.sendFile(__dirname + '/views/deleteTask.html')
});
app.post('/deleteTaskData', function (req, res) {
   let taskDetails = req.body;
   let taskNo = parseInt(taskDetails.taskID);

   Task.deleteOne(
       {'taskID': taskNo}, function(err, doc){
           console.log(doc);
       }
   );

   res.redirect('/listTasks');
});
app.get('/clearCompleted', function(req, res){
    Task.deleteMany({'tStatus': 'Complete'}, function(err, doc){
        console.log(doc);
    });

    res.redirect('/listTasks');
});
app.get('/newDev', function(req, res){
    res.sendFile(__dirname + '/views/newDev.html');
});
app.get('/listDevs', function(req, res){
    Developer.find().exec(function(err,data){
        res.render('listDevs.html', {devsDbs:data});
    });
});
app.post('/devData', function(req, res){
    let devDetails = req.body;
    let inputStatus = req.body.selLev;

    new Developer({
        'devName.firstName': devDetails.dFirst,
        'devName.lastName': devDetails.dLast,
        'devLevel': inputStatus,
        'devAddress.state': devDetails.DAstate,
        'devAddress.suburb': devDetails.DAsub,
        'devAddress.street': devDetails.DAstreet,
        'devAddress.unit': devDetails.DAunit
    }).save(function(err){
        if (err) throw err;

        console.log('Task Successfully Inserted to DB.');
    });

    res.redirect('/listDevs');
});
app.get('/:oldfirstname/:newfirstname', function(req, res){
    let oldFName = req.params.oldfirstname;
    let newFName = req.params.newfirstname;

    Developer.updateMany({'devName.firstName': oldFName}, {$set: {'devName.firstName': newFName}},
    function(err, doc){
        console.log(doc);
    });

    res.redirect('/listDevs');
});


function getNewId() {
    return (Math.floor(100000 + Math.random() * 900000));
};

app.listen(8080);
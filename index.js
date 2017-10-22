// Require objects.
var express  = require('express');
var app      = express();
var aws      = require('aws-sdk');
var queueUrl = "yourQueueURL";
var receipt  = "";
    
// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');
//aws.config.loadFromPath('/config.json');

// Instantiate SQS.
var sqs = new aws.SQS();

// Creating a queue.
// app.get('/create', function (req, res) {
//     var params = {
//         QueueName: "MyFirstQueue"
//     };
    
//     sqs.createQueue(params, function(err, data) {
//         if(err) {
//             res.send(err);
//         } 
//         else {
//             res.send(data);
//         } 
//     });
// });

// Listing our queues.
app.get('/list', function (req, res) {
    sqs.listQueues(function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Sending a message.
// NOTE: Here we need to populate the queue url you want to send to.
// That variable is indicated at the top of app.js.
app.get('/send', function (req, res) {
    //Objct
    var idVideo = 3;
    var nombreVideo = "Video3";

    var params = {
        DelaySeconds: 0,
        MessageAttributes: {
         "IdVideo": {
           DataType: "String",
           StringValue: idVideo.toString()
          },
         "NombreVideo": {
           DataType: "String",
           StringValue: nombreVideo
          }
        },
        MessageBody: "Video por procesar {idVideo}",
        QueueUrl: queueUrl
       };
       
    sqs.sendMessage(params, function(err, data) {
        if(err) {
            console.log(`Error enviando mensaje a la cola: ${err}`)
            res.send(err);
        } 
        else {
            res.send(data);
            console.log(`data: ${data}`)
            //Print message id
            console.log(`idmensaje: ${data.MessageId}`)
            //Print message body
            console.log(`body: ${data.MD5OfMessageBody}`)
            //Print message attibute
            console.log(`attibute: ${data.MD5OfMessageAttributes}`)
        } 
    });
});

// Receive a message.
// NOTE: This is a great long polling example. You would want to perform
// this action on some sort of job server so that you can process these
// records. In this example I'm just showing you how to make the call.
// It will then put the message "in flight" and I won't be able to 
// reach that message again until that visibility timeout is done.
app.get('/receive', function (req, res) {
    var params = {
        AttributeNames: [
           "SentTimestamp"
        ],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: [
           "All"
        ],
        QueueUrl: queueUrl,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
       };
    
    sqs.receiveMessage(params, function(err, data) {
        if(err) {
            console.log(`Error recibiendo mensaje de la cola: ${err}`)
            res.send(err);
        } 
        else {
            var body = data.Messages[0].Body;
            console.log(`body: ${data}`)
            var ReceiptHandle = data.Messages[0].ReceiptHandle; 
            console.log(`receipt-id: ${ReceiptHandle}`)
            //Items value
            var valoridVideo = data.Messages[0].MessageAttributes['IdVideo'].StringValue
            console.log(`idVideo: ${valoridVideo}`)
            var valornombreVideo = data.Messages[0].MessageAttributes['IdVideo'].StringValue
            console.log(`nombreVideo: ${valornombreVideo}`)
            res.send(data);
        } 
    });
});

// Deleting a message.
app.get('/delete', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        ReceiptHandle: receipt
    };
    
    sqs.deleteMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Purging the entire queue.
app.get('/purge', function (req, res) {
    var params = {
        QueueUrl: queueUrl
    };
    
    sqs.purgeQueue(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Start server.
var server = app.listen(5000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AWS SQS example app listening at http://%s:%s', host, port);
});
var express = require('express')
var bodyparser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
const { Console } = require('console')

app.use(express.static(__dirname))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))

var dbUrl ="mongodb+srv://<user>:<password>@cluster0.vsncv.mongodb.net/<database>?retryWrites=true&w=majority"

mongoose.Promise = Promise

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req,res) =>{
    Message.find({}, (err,messages)=>{
        res.send(messages)
    })
})

app.post('/messages', async(req,res) =>{
    try{
        var message = new Message(req.body)
        var savedmessage = await message.save()
        console.log('saved')

        var cencored = await Message.findOne({ message : 'badword' })

        if(cencored)
            await Message.remove({ _id: cencored.id })
        else
            io.emit('message', req.body)
        res.sendStatus(200)  
    }
    catch (error){
        sendStatus(500)
        return console.log(error)
    }
    finally{
        console.log('post try catch')
    }

})

io.on('connection', (socket) =>{
console.log('a user connected')
})

mongoose.connect(dbUrl, (err) =>{
    console.log('a user connected to mongo')
})

var server = http.listen(3000, () => {
console.log('server is listening at port ',server.address().port)
})

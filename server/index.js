//Imports
const express = require('express')
const app = express()
const process = require('process')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/User')
const UserSession = require('./models/UserSession')
const path = require('path')
const multer = require('multer')
const Grid = require('gridfs-stream')
const methodOverRide = require('method-override')
const GridfsStorage = require('multer-gridfs-storage')
const crypto = require('crypto')
const port = process.env.PORT || 8000
const cors = require('cors')
app.use(bodyParser.json()) //Body Parser MiddleWare
app.use(express.json())
app.use(cors())
app.use(methodOverRide('_method'))
// const conLink = 'mongodb://hamza1331:abc@1234@ds125372.mlab.com:25372/demo_dreamerz'
const mongoURL ='mongodb://localhost:27017/muziq'
mongoose.connect(mongoURL) //MongoDB connection using Mongoose
var conn = mongoose.connection //Mongo Connection Instance
var gfs = ''
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo)
  gfs.collection('uploads')
    console.log('database connected...')
})
var storage = new GridfsStorage({
    url: mongoURL,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({
    storage
  });
  app.get('/getdata', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({files:'No files'})
      } else if (err) return res.json(err)
      else{
        files.map(file=>{
          if(file.contentType.includes('image')){
            file.isImage = true
          }
          else
          file.isImage = false
        })
        return res.json(files)
      }
    })
  })
  
  /*
   @route: /upload
   desc: uploading file to db
  */
  app.post('/upload', upload.single('file'), (req, res) => {
    // console.log('requested')
    console.log(req.file)
    res.json({file:req.file})
    // res.redirect('http://localhost:3000')
  })
  app.get('/filedata',(req,res)=>{
    let isImage = fileData.contentType.includes('image')
    fileData.isImage = isImage
    return res.json(fileData)
  })
  /*
   @route: /file/filename
   desc: get a file from database and render as image
  */
  app.get('/getfile/:filename', (req, res) => {
    gfs.files.findOne({
      filename: req.params.filename
    }, (err, file) => {
      if (!file) return res.status(404).json({
        err: 'File not exists'
      })
      else if (err) return res.json(err)
      else {
          const readStream = gfs.createReadStream(file.filename)
          readStream.pipe(res)
      }
    })
  })
  
  /*
  @route /files/:id DELETE
  @desc delete a file from DB
  */
  app.delete('/files/:id',(req,res)=>{
    gfs.remove({_id:req.params.id,root:'uploads'},(err,gridStorage)=>{
      if(err)
      return res.status(404).json({err:err})
    })
    res.redirect('/')
  })
app.get('/', function (req, res) { //HomePage for API
    res.send('Hello world form Bookapp...')
})
/* ******************** Login ************************* */
app.post('/api/accounts/signup', (req, res) => {
    const {
        body
    } = req
    let {
        firstName,
        lastName,
        email,
        password
    } = body
    if (!firstName) {
        return res.send({
            success: false,
            message: "User must must have First Name"
        })
    }
    if (!email) {
        return res.send({
            success: false,
            message: "User must must have Email"
        })
    }
    if (!password) {
        return res.send({
            success: false,
            message: "User must must have Password"
        })
    }
    if (!lastName) {
        return res.send({
            success: false,
            message: "User must must have Last Name"
        })
    }
    email = email.toLowerCase()
    User.find({
        email: email
    }, (err, prevUser) => {
        if (err) {
            console.error(err);
            return res.send({
                success: false,
                message: "Internal Server Error"
            })
        } else if (prevUser.length > 0) {
            return res.send({
                success: false,
                message: "User already exist"
            })
        }

        let newUser = new User();
        newUser.email = email;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.password = newUser.generateHash(password)
        newUser.save((err, user) => {
            if (err) {
                console.error(err);
                return res.send({
                    success: false,
                    message: "Internal Server Error"
                })
            }
            return res.send(user)
        })
    })
})
app.post('/api/accounts/signin', (req, res) => {
    const {
        body
    } = req
    let {
        email,
        password
    } = body

    email = email.toLowerCase()
    if (!email) {
        return res.send({
            success: false,
            message: "User must must have an Email"
        })
    };
    if (!password) {
        return res.send({
            success: false,
            message: "User must must have a Password"
        })
    }
    User.find({
        email: email
    }, (err, users) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Internal Server Error'
            })
        }
        if (users.length != 1) {
            return res.send({
                success: false,
                message: 'Invalid Login'
            })
        }
        const user = users[0]
        if (!user.validPassword(password)) {
            return res.send({
                success: false,
                message: 'Invalid Password'
            })
        }
        let userSession = new UserSession()
        userSession.userId = user._id
        userSession.save((err, doc) => {
            if (err) {

                return res.send({
                    success: false,
                    message: 'Internal Server Error'
                })
            }
            return res.send({
                success: true,
                message: 'Sign in Succesfully',
                token: doc._id,
                firstName: user.firstName
            })
        })


    })

})
app.get('/api/accounts/verify/:token', (req, res) => {
    const {
        token
    } = req.params
    console.log(token)
    UserSession.findOne({
        userId: token
    }, (err, session) => {
        if (err) {
            return res.send({
                success: false,
                message: "Internal Server Error"
            })
        }
        if (!session.isDeleted)
            return res.send({
                success: true,
                message: 'Good'
            })
        else
            return res.send({
                success: false,
                message: "Session deleted"
            })

    })
})
app.post('/api/accounts/logout', (req, res) => {
    const {
        token
    } = req.body
    // UserSession.findByIdAndUpdate(token,$set({isDeleted:true}),null,(err,session)=>{
    //     if(err){
    //         return res.send({success:false,message:"Internal Server Error"})
    //     }
    //     return res.send({success:true,message:"Session deleted"})

    // })
    UserSession.findOneAndUpdate({
        userId: token
    }, {
        $set: {
            isDeleted: true
        }
    }, {
        new: true
    }, (err, session) => {
        if (err) {
            console.error(err)
            return res.send({
                success: false,
                message: "Internal Server Error"
            })
        }
        return res.send({
            success: true,
            message: "Session deleted"
        })
    })
})

//Server
app.listen(port, function () {
    console.log('Listening on port' + port)
})
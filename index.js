const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// for firebase authentication
const firebaseConfig = {
  apiKey: "AIzaSyDNyu6KsIHccqAbK1_wjzHbrt_Yc0muUfc",
  authDomain: "socialap-73771.firebaseapp.com",
  databaseURL: "https://socialap-73771-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "socialap-73771",
  storageBucket: "socialap-73771.appspot.com",
  messagingSenderId: "809928703007",
  appId: "1:809928703007:web:b9642b9d62c52dba56e92a",
  measurementId: "G-8GVN065EK0"
};

admin.initializeApp(firebaseConfig) ;

const express = require('express')
const app = express() ;
const db = admin.firestore() ;
const auth = getAuth() ;

// create post route
app.get('post', (req, res) => {
 db.collection('Posts').get()
    .then(data => {
        let posts = []
        data.forEach((doc) => {
            posts.push(doc.data())
        })
        return res.json(posts);
    })
    .catch((err) => console.error(err)) ;
}) ;

app.post('post', (req, res) => {
    let newPost = {
        body: req.body.body,
        handle: req.body.handle, 
        createdAt : new Date().toISOString
    }

    db.collection('Post')
    .add(newPost)
    .then((doc) => {
        res.json({message : `Post with id ${doc.id} created successfully`})
    })
    .catch((err) => {
        res.status(500).json({message: 'sth went wrong'})
        console.error(err)
    })
});

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// exports.getPost = functions.https.onRequest((req, res ) => {
//     admin.firestore().collection('Posts').get()
//     .then(data => {
//         let posts = []
//         data.forEach((doc) => {
//             posts.push(doc.data())
//         })
//         return res.json(posts);
//     })
//     .catch((err) => console.error(err)) ;
// })

// exports.createPost = functions.https.onRequest( (req, res) => {
//     let newPost = {
//         body: req.body.body,
//         handle: req.body.handle, 
//         createdAt : admin.firestore.Timestamp.fromDate(new Date())
//     }

//     admin.firestore().collection('Post')
//     .add(newPost)
//     .then((doc) => {
//         res.json({message : `Post with id ${doc.id} created successfully`})
//     })
//     .catch((err) => {
//         res.status(500).json({message: 'sth went wrong'})
//         console.error(err)
//     })
// })

//sign up route
app.post('user', (req,res) => {
    let newUser = {

    }

    //check existed handler

    //create new user
    createUserWithEmailAndPassword(auth, req.email, req.password)
    .then((userCredential) => {

    }) 
    //return token + uid
    .catch( (err) => {
        res.status(500).json({message: "sth is wrong"});
        console.error(err);
    })
})

exports.api = functions.region('asia').https.onRequest(app);
// https://firebase.google.com/docs/web/setup

const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
import { initializeApp } from 'firebase/app';

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

admin.initializeApp() ;
// const admin = initializeApp(); 
const express = require('express');
const app = express() ;

//firebase conn
// for firebase authentication

const fConfig = {
    apiKey: "AIzaSyDNyu6KsIHccqAbK1_wjzHbrt_Yc0muUfc",
    authDomain: "socialap-73771.firebaseapp.com",
    databaseURL: "https://socialap-73771-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "socialap-73771",
    storageBucket: "socialap-73771.appspot.com",
    messagingSenderId: "809928703007",
    appId: "1:809928703007:web:b9642b9d62c52dba56e92a",
    measurementId: "G-8GVN065EK0"
  };
const firebase = require('firebase');
// import firebase from 'firebase/app'
firebase.initializeApp(fConfig);
//suggest : extend npm intellisense ,   npm i firebase firebase-tools --save

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
app.post('/signUp', (req,res) => {
    let newUser = {
        email: req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle: req.body.handle,
    }

    //check existed handler
    let token, userId ;
    db.doc(`users/${newUser.handle}`).get()
    .then( doc=> {
        if(doc.exists) {
            return res.status(400).json({ handle : 'this handle is already taken ' })
        } else {
            return firebase.auth().createUserWithEmailAndPassword(req.email, req.password)
        }
    })
    .then(data => {
        userId = data.user.id ;
        return data.user.getIdToken() ;
    })
    .then( (idToken) => {
        token = idToken
        const userCredential = {
            handle:newUser.handle , 
            email: newUser.email, 
            createdAt: new Date().toISOString ,
            userId
        };
        //save to database
        return db.doc(`user/${newUser.handle}`).set(userCredential) ; 
    })
    .then(() => {
        return res.status(201).json( { token }) ;
    })
    .catch(err => {
        console.error(err) ;
         
        return res.status(500).json( {err: err.code });
    })
})

//     //create new user
//     createUserWithEmailAndPassword(auth, req.email, req.password)
//     .then((userCredential) => {
//         res.status(201).json({ message : `user ${userCredential.user.uid} signed up successfully `})
//     }) 
//     //return token + uid
//     .catch( (err) => {
//         res.status(500).json({message: "sth is wrong"});
//         console.error(err);
//     })
// })

exports.api = functions.region('asia').https.onRequest(app);
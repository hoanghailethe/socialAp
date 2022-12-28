const functions = require("firebase-functions");

const express = require('express');
const app = express() ;

const { getAllPosts, createOnePost } = require("./handler/post") ;
const {authMiddleWare} = require('./firebase/authMiddleware'); 

// create post route
app.get('post', getAllPosts ) ;
app.post('post', authMiddleWare, createOnePost);

//USER ROUTE: signup + log in
app.post('/signUp', signUpUser)
app.post('/login', logIn)

exports.api = functions.region('asia').https.onRequest(app);
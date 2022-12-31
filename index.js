const functions = require("firebase-functions");

const express = require('express');
const app = express() ;

const { getAllPosts, createOnePost } = require("./handler/post") ;
const {authMiddleWare} = require('./firebase/authMiddleware'); 
const {signUpUser , logIn , editProfile , resetPassword , uploadImage} = require('./handler/user') ;
const {likePost, dislikePost}=  require('./handler/like') ;
const {addComment, deleteComment}=  require('./handler/comment') ;

// POST routes
app.get('post', getAllPosts ) ; //get top comment - get more comment //
app.post('post', authMiddleWare, createOnePost);
    //delete post -> delete comment and like

//USER ROUTE: signup + log in + edit / update info + resetPassword
app.post('/signUp', signUpUser)
app.post('/login', logIn)
app.post('/user/image',authMiddleWare , uploadImage)
app.post('/profile', authMiddleWare, editProfile)  ; // note : Image Avartar ?? question : what about photo facebook or lib , video
// app.post('/profile', authMiddleWare, resetPassword) ;

// LIKE routes
// app.post('/like/postId', authMiddleWare , likePost) ;
// app.post('/dislike/postId',  authMiddleWare , dislikePost) ;

//COMMENT routes 
// app.post('/post/comment', authMiddleWare , addComment) ;
// app.post('/post/deleteComment', authMiddleWare , deleteComment) ;

// NOTIFICATION routes 
// RELATIONSHIP routes
// LIB PICTUREs / Video ?   -- extension

exports.api = functions.region('asia').https.onRequest(app);
const functions = require("firebase-functions");

const express = require('express');
const app = express() ;

const { getAllPosts, createOnePost , getPostByPostId , commentOnPost, deletePostById} = require("./handler/post") ;
const {authMiddleWare} = require('./firebase/authMiddleware'); 
const {signUpUser , logIn , editProfile , resetPassword , uploadImage, addUserDetail, getAuthenticatedUser, getUserDetailByUid } = require('./handler/user') ;
const {likePost, dislikePost}=  require('./handler/like') ;
const {addComment, deleteComment}=  require('./handler/comment') ;
const { createNotificationOnLike, deleteNotificationOnUnlike, createNotificationOnComment , markReadNotification } = require('./handler/notification') ; 

// POST routes
app.get('post', getAllPosts ) ; //get top comment - get more comment //
app.post('post', authMiddleWare, createOnePost);
    //delete post -> delete comment and like
//TODO: get a post by Id
app.get('/post/:postId' , getPostByPostId ) ;
app.delete('/post/:postId', authMiddleWare, deletePostById) ;


//USER ROUTE: signup + log in + edit / update info + resetPassword
app.post('/signUp', signUpUser)
app.post('/login', logIn)
app.post('/user/image',authMiddleWare , uploadImage) ;
app.post('/user/image',authMiddleWare , addUserDetail) ;
app.post('/user/image',authMiddleWare , getAuthenticatedUser) ;
// app.post('/profile', authMiddleWare, editProfile)  ; // note : Image Avartar ?? question : what about photo facebook or lib , video
// app.post('/profile', authMiddleWare, resetPassword) ;
// Get other User's detail Info
app.get('/user/:userId', getUserDetailByUid) ;

// LIKE routes
app.post('/like/:postId', authMiddleWare , likePost) ;
app.post('/dislike/:postId',  authMiddleWare , dislikePost) ;

//COMMENT routes 
app.post('/post/:postId/comment' , authMiddleWare, commentOnPost) ;
// app.post('/post/comment', authMiddleWare , addComment) ;
// app.post('/post/deleteComment', authMiddleWare , deleteComment) ;

// NOTIFICATION routes  
    //markNotificationRead : 3 44 58
    //this route only for backend to mark data
    app.post('/notification' , authMiddleWare , markReadNotification)

// RELATIONSHIP routes
// LIB PICTUREs / Video ?   -- extension

exports.api = functions.region('asia').https.onRequest(app);
exports.createNotificationOnLike ; 
exports.deleteNotificationOnUnlike ;
exports.createNotificationOnComment ;
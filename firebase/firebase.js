const fConfig = require("./config")

const firebase = require('firebase');

firebase.initializeApp(fConfig);

module.exports = firebase ;


//suggest : extend npm intellisense ,   npm i firebase firebase-tools --save
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
// https://firebase.google.com/docs/web/setup
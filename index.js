const functions = require("firebase-functions");
const admin = require('firebase-admin');

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

admin.initializeApp() ;


exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.getPost = functions.https.onRequest((req, res ) => {
    admin.firestore().collection('Posts').get()
    .then(data => {
        let posts = []
        data.forEach((doc) => {
            posts.push(doc.data())
        })
        return res.json(posts);
    })
    .catch((err) => console.error(err)) ;
})

exports.createPost = functions.https.onRequest( (req, res) => {
    let newPost = {
        body: req.body.body,
        handle: req.body.handle, 
        createdAt : admin.firestore.Timestamp.fromDate(new Date())
    }

    admin.firestore().collection('Post')
    .add(newPost)
    .then((doc) => {
        res.json({message : `Post with id ${doc.id} created successfully`})
    })
    .catch((err) => {
        res.status(500).json({message: 'sth went wrong'})
        console.error(err)
    })
})
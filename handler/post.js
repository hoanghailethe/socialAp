const db = require("../firebase/admin")

exports.getAllPosts = (req, res) => {
    db.collection('Posts').get()
       .then(data => {
           let posts = []
           data.forEach((doc) => {
               posts.push(doc.data())
           })
           return res.json(posts);
       })
       .catch((err) => console.error(err)) ;
   }

exports.createOnePost = 
    (req, res) => {
        let newPost = {
            body: req.body.body,
            handle: req.handle, 
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
    }

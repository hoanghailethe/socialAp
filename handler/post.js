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

exports.createOnePost = (req, res) => {
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

exports.getPostByPostId = (req, res ) => {
    postInfoWithComment = {} ;

    db.doc(`posts/${req.params.postId}`).get()
        //post main content
        .then( doc => {
            if (doc.exists()) {
                postInfoWithComment = doc.data() ;
                postInfoWithComment.postId = doc.id ;
            } else {
                res.status(500).json({err: "cannot find the post"}) ;
            }
        })
        //add comments 
        .then( () => {
            comments = [];

            db.collection('comment')
                .where('postId' , '==' , req.params.postId)
                .orderBy('createdAt', 'desc')
                .then(doc => {
                    comments.push(doc.data())
                });
            
                postInfoWithComment.comments = comments ;
        })
        .catch((err) => {
            res.status(500).json({message: 'sth went wrong'})
            console.error(err)
        });
}


//comment on a post:
exports.commentOnPost = ( req, res ) => {

    if (req.body.body.trim() === '') return res.status(400).json({error: "Must not be empty"}) ;

    const newComment = {
        postId : req.params.postId ,
        userId : req.user.handle ,
        content : req.body.body,
        createdAt : new Date().toISOString,
        
        //add user IMG here too
        userimageUrl : req.user.imageUrl 
    } ;

    // First check if the post still existed first
    db.doc(`posts/${req.params.postId}`).get()
        .then( doc =>{
            if (doc.exists) {
                return db.collection('comments').add(newComment) ;
            }
        })
        .then(()=>{
            res.json({message: "Comment successfully", comment : newComment})
        })
        .catch((err) => {
            res.status(500).json({message: 'Sth went wrong'})
            console.error(err)
        });
        
}
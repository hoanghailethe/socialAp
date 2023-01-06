const db = require("../firebase/admin")

exports.getAllPosts = (req, res) => {
    db.collection('Posts').get()
       .then(data => {
           let posts = []
           data.forEach((doc) => {
               posts.push({
                postId : doc.id ,
                body : doc.data().body ,
                userImg : doc.data().userImageUrl ,
                userId : doc.data().userId ,
                createdAt : doc.data().createdAt ,
                commentCount : doc.data().commentCount ,
                likeCount : doc.data().likeCount
            })
           })
           return res.json(posts);
       })
       .catch((err) => console.error(err)) ;
   }

exports.createOnePost = (req, res) => {
        let newPost = {
            body: req.body.body,
            handle: req.handle, 
            createdAt : new Date().toISOString , 
            //add user IMG here too
            userImageUrl : req.user.imageUrl, 
            likeCount: 0,
            commentCount : 0
        }
    
        db.collection('Post')
        .add(newPost)
        .then((doc) => {
            newPost.postId = doc.id ;
            res.json({message : `Post with id ${doc.id} created successfully` , newPost})
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



//Delete a post
exports.deletePostById = (req, res) => {
    const postDoc = db.doc(`post/${req.params.postId}`) ;
    postDoc.get()
        .then(doc =>{
            if(!doc.exists) {
                res.status(400).json({message: "Post not exist"})
            } else if (req.user.handle !== doc.data().userId ) {
                res.status(400).json({error: "Unauthorized"})
            } else {
                postDoc.delete() ;
            }
        })
        //Delete comment of the post
        .then(() => {
            // db.collection('comments')
            // .where('postId' ,'==' , req.params.postId)
            // .get().delete() ; 
        })
        // DELETE like
        .then( () =>{
            // db.collection('likes')
            // .where('postId' ,'==' , req.params.postId)
            // .get().delete() ;
        })
        .then(() => {
            res.json({message: "post deleted successfully"}); 
        })
        .catch((err) => {
            res.status(500).json({message: 'Sth went wrong while deleting post'})
            console.error(err)
        })         
}
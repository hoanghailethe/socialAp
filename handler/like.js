const { db } = require("../firebase/admin")

exports.likePost = (req, res) => {
    const newLikePost = {
        userId : req.user.handle , 
        postId: req.params.postId
    }

    const likePostDocument = db.collection('likes')
        .where( 'userId' , '==' , newLikePost.userId )
        .where('postId',  '==' , newLikePost.postId ).limit(1) ;

    const postDoc = db.doc(`/posts/${newLikePost.postId}`) ;
    // check if the POST existed
    let postData ;
    postDoc.get()
        .then( doc => {
            if (!doc.exists) {
                res.status(400).json({error: " Post not existed"})
            } else {

                postData =doc.data;
                postId = doc.id ;

                likePostDocument.get()
                    .then( like => {
                        if (!like.exists) {
                            db.collection('like').add( newLikePost );

                            //increase like count
                            postData.likeCount++ ;
                            postDoc.update({likeCount : postData.likeCount})
                        } 
                    })
            }
        })
        .catch((err) => {
            res.status(500).json({message: 'sth went wrong'})
            console.error(err)
        })
}

exports.dislikePost =(rq, rs) => {
    const likePostDocument = db.collection('likes')
    .where( 'userId' , '==' , rq.user.handle )
    .where('postId',  '==' , rq.params.postId ).limit(1) ;

    const postDoc = db.doc(`/posts/${rq.params.postId}`) ; 
    let postdata ;
    postDoc.get()
        .then( (doc) => {
            if (!doc.exists) {
                return rs.status(400).json( {error : "Post not exist" } );
            } else {
                postdata = doc.data() ;
                postdata.postId = doc.id ;
                return likePostDocument.get() ;
            }
        })
        .then( (data) => {
            //if cannot find like doc of that post
            if ( data.empty ) {
                res.status(400).json({error: "Post has not been liked yet"})
            } else {
                // delete likeDoc
                return  db.doc(`like/${data.docs[0].id}`).delete()
                    //update likeCount in postDoc
                .then(() => {
                    postdata.likeCount -- ;
                    postDoc.update({likeCount : postdata.likeCount}) ;     
                })
                .then(()=>{
                    return res.json(postdata) ;
                })
            }
        })
        .catch((err) => {
            res.status(500).json({message: 'sth went wrong'})
            console.error(err)
        });
}
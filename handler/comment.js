const db = require('../firebase/admin') ;

//comment on a post:
exports.commentOnPost = ( req, res ) => {

    if (req.body.body.trim() === '') return res.status(400).json({error: "Must not be empty"}) ;

    const newComment = {
        postId : req.params.postId ,
        userId : req.user.handle ,
        content : req.body.body,
        createdAt : new Date().toISOString,
        
        //add user IMG here too
        userImageUrl : req.user.imageUrl, 
    } ;

    // First check if the post still existed first
    db.doc(`posts/${req.params.postId}`)
        .get()
        .then( doc =>{
            if (doc.exists) {
                //update the post :commentCount
                doc.ref.update({commentCount: doc.data().commentCount + 1})
                
            } else {
                return res.status(400).json({error: "post not found"})
            }
        })
        .then( () => {
            //adding the comment
            return db.collection('comments').add(newComment) ;
        })
        .then(()=>{
            res.json({message: "Comment successfully", comment : newComment})
        })
        .catch((err) => {
            res.status(500).json({message: 'Sth went wrong'})
            console.error(err)
        });
        
}


exports.deleteComment = (rq, rs) => {
    const docRef = db.doc(`/comments/${rq.params.cmtId}`) ;
    docRef.get()
        .then((doc) => {
            if(!doc.exists) {
                rs.status(400).json({error: "comment not exist"})
            } else if(rq.user.handle !== doc.data().userId) {
                rs.status(400).json({error: "Unauthorized"})
            }
            docRef.delete() ; 
        })
        .then(() => {
            res.json(`Comment with id ${rq.params.cmtId} deleted successfully`)
        })
        .catch(err => {
            res.status(500).json({message: 'Sth went wrong while deleting comment'})
            console.error(err)
        });


}
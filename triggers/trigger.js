const {db} =require('../firebase/admin') ;
const functions = require("firebase-functions");

exports.createNotificationOnLike = functions.region('asia')
        .firestore.document('likes/{id}')
        .onCreate((snapshot) => {
            return db.doc(`/notifications/${snapshot.id}`)
                .get()
                .then((doc) => {
                    if(doc.exists && doc.data().userId !== snapshot.data().userId) {
                        return db.doc(`notification/${snapshot.id}`)
                                .set({
                                    createdAt: new Date().toISOString ,
                                    recipient: doc.data().userId ,
                                    sender :snapshot.data().userId ,
                                    type: 'like',
                                    read: false,
                                    postId: doc.id
                                })
                    }
                })
                .catch(err => console.log(err)) ;
        })

exports.deleteNotificationOnUnlike = functions.region('asia')
        .firestore.document('like/{id')
        .onDelete((snapshop) => {
            return db.doc(`/notification/${snapshop.id}`).delete();
        })
        .catch(err => console.log(err)) ;

exports.createNotificationOnComment = functions.region('asia')
        .firestore.document('comment/{id}')
        .onCreate((snapshot) => {
            return db.doc(`posts/${snapshot.data().postId}`)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        return db.doc(`notifications/${snapshot.id}`)
                            .set( { 
                                createdAt: new Date().toISOString ,
                                recipient : doc.data().userId ,
                                sender: snapshot.data().userId ,
                                type: 'comment',
                                read: false,
                                postId: doc.id
                             } )
                    }
                })
                .catch(err => console.log(err)) ;
        })

exports.changeUserImgInPosts = functions.region('asia')
        .firestore.document('user/{id}')
        .onUpdate((change) => {
            if(change.before.data().imgUrl !== change.after.data().imgUrl ) {
                console.log("user img has changed")
                let batch = new db.batch() ;

                return db.document('/posts')
                    .where('userId' ,'==' ,change.before.data().userId).get()
                    .then((data) => { //data is an array many pots
                        data.forEach( (doc) => {
                            const post = db.doc(`/posts/${data.id}`).get() ;
                            batch.update(post, {userImg : change.after.data().imgUrl});
                        });
                        return batch.commit();
                    })
            } else return true ;
        })

//After Delete a POST : delete comments and like of that post
exports.onPostDelete = functions.region('asia')
        .firestore.document('post/{id}')
        .onDelete((snapshot, context) => {
            const postId = context.params.id ;
            const batch = db.batch() ;
            //delete comments
            return db.collection('comments')
                .where('postId' , '==' , postId)
                .get()
                .then((cmts) => {
                    cmts.forEach(cmtdoc => {
                        batch.delete(db.doc(`comments/${cmtdoc.id}`)) ; 
                    })
                    //delete like after
                    return db.collection('like').where('postId' , '==' ,postId).get()
                        
                })
                .then(like => {
                    like.forEach(likedoc => {
                        batch.delete(db.doc(`likes/${likedoc.id}`));
                    })
                    //delete notification also
                    return db.collection('notifications').where("postId" , "==" , postId).get()
                })
                .then(notis => {
                    notis.forEach(notidoc => {
                        batch.delete(db.doc(`notifications/${notidoc.id}`));
                    })
                })
                .then(()=>{
                    return batch.commit() ;
                })
                .catch(err => console.log(err));
        })
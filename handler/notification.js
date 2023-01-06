const {db} =require('../firebase/admin') ;
const functions = require("firebase-functions");

exports.markNotificationRead = (rq,rs) => {
    let batch = db.batch() ; 

    rq.body.forEach( notificationId => {
        const notificationDoc = db.doc(`notifications/${notificationId}`) ;
        batch.update(notificationDoc, {read : true });
    });
    batch.commit()
        .then( () => {
            rs.json( {message : "Notifications marked as read"}) ;
        })
        .catch (err => {
            console.error(err) ;
            return rs.status(500).json(err) ;
        })
}

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
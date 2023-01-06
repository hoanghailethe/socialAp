const {db} =require('../firebase/admin') ;


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


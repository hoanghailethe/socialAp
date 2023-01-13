import { admin, db } from './admin';

export default (req, res, next ) => {
    let idToken
    if (!req.headers.authorization.token || !req.headers.authorization.token.startWith('Bearer ') ) {
        return res.status(403).json({error: "Not logged in"})
    }

    idToken =req.headers.authorization.token.split('Bearer ')[1]

    admin.auth().verifyIdToken(idToken)
        .then( decodeToken => {
            console.log(decodeToken) ; 
            req.user = decodeToken ;
            // get USER from DB
            return db
                .collection('user')
                .where("userId", "==", req.user.uid)
                .limit(1)
                .get()
        })
        .then( data => {
            // change the request (add handle data to it)  make sure it has handle
            req.handle = data.docs[0].data().handle ;
            //add userImg link url here too for Comment access quick
            req.user.imageUrl = data.docs[0].data().imgUrl ; 
            return next()
        })
        .catch (err => {
            console.error(err) ;
            return res.status(403).json ({message : "Error when validating token " + err.code})
        })
}

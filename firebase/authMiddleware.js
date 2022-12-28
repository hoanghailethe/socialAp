const firebase = require('./firebase') ;

module.exports = (req, res, next ) => {
    let idToken
    if (!req.headers.authorization.token || !req.headers.authorization.token.startWith('Bearer ') ) {
        return res.status(403).json({error: "Not logged in"})
    }

    idToken =req.headers.authorization.token.split('Bearer ')[1]

    firebase.auth().verifyIdToken(idToken)
        .then( decodeToken => {
            console.log(decodeToken) ; 
            req.user = decodeToken ;
            return db.collection('user').where("userId", "==", req.user.uid).limit(1).get()
        })
        .then( data => {
            req.handle = data.doc(0).data().handle ;
            return next()
        })
        .catch (err => {
            console.error(err) ;
            return res.status(403).json ({message : "Error when validating token " + err.code})
        })
}

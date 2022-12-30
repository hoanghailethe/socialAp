const firebase = require('../firebase/firebase')
const db = require('../firebase/admin')
const { validateNewUser , validateLogInUser } = require('../utils/validator')

exports.signUpUser = (req,res) => {
    let newUser = {
        email: req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle: req.body.handle,
    }

    // use Validator Helper
    const {isValid, errors} = validateNewUser(newUser) ;
    if (isValid == false) {
        return res.status(401).json(errors) ;
    }
    
    //check existed handler
    let token, userId ;
    db.doc(`users/${newUser.handle}`).get()
    .then( doc=> {
        if(doc.exists) {
            return res.status(400).json({ handle : 'this handle is already taken ' })
        } else {
            return firebase.auth().createUserWithEmailAndPassword(req.email, req.password)
        }
    })
    .then(data => {
        userId = data.user.id ;
        return data.user.getIdToken() ;
    })
    .then( (idToken) => {
        token = idToken
        const userCredential = {
            handle:newUser.handle , 
            email: newUser.email, 
            createdAt: new Date().toISOString ,
            userId
        };
        //save to database
        return db.doc(`user/${newUser.handle}`).set(userCredential) ; 
    })
    .then(() => {
        return res.status(201).json( { token }) ;
    })
    .catch(err => {
        console.error(err) ;
         
        return res.status(500).json( {err: err.code });
    })
}

exports.logIn = (req, res) => {
    const user = {
        email : req.body.email ,
        password : red.body.password
    }

    let isValid, errors = validateLogInUser(user);
    if (isValid == false) {
        return res.status(401).json(errors) ;
    }

    firebase.auth().getUserWithEmailAndPassword(user.email, user.password) 
        .then(data => {
            return data.user.getIdToken ;
        })
        .then( token => {
            return res.json(token) ;
        })
        .catch(err => {
            console.error(err) ;
            if(err.code === 'auth/wrong-password') {
                return res.status(403).json({general : "Wrong credential, please retry"})
            }
            return res.status(500).json({error: err.code});
        })
}

const uploadImage = require ('../utils/uploadImage') ;
exports.editProfile = (req,res) => {
    let userInfo = {
        email : req.body.email ,
        phone : req.body.phone ,
        img: 'blank holder img URL',
        status : req.body.status ,
        handle: req.body.handle,
    }

    // check if there a file img upload

    // start Uploadfile  - if success return img url 
    let {isSuccess , imgUrl } = uploadImage( req ) ;

    if (isSuccess) {
        userInfo.img = imgUrl ;
    }

    db.doc(`user/${userInfo.handle}`).limit(1).get()
        .then ( doc => {
            if (doc.exists) {
                // pass 
            } else {    
                return res.status(404).json({message : "user not exist"})
            }
        } )
        .then(
            //update user in db
            
        )

}
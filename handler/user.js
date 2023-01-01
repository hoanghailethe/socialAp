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
            userId,
            imgUrl : "defauult IMG link"
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
const config = require('../firebase/config')
exports.editProfile = (req,res) => {
    let userInfo = {
        email : req.body.email ,
        phone : req.body.phone ,
        imgUrl: 'blank holder img URL',
        status : req.body.status ,
        handle: req.body.handle,
    }

    // check if there a file img upload

    // start Uploadfile  - if success return img url 
    let {isSuccess , imgUrl } = uploadImage( req ) ;

    if (isSuccess) {
        userInfo.imgUrl = imgUrl ;
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

exports.uploadImage = (req,res) => {
    const BusBoy = require('busboy') ;
    const path = require('path')
    const os = require('os')
    const fs = require('fs')

    const busboy = new BusBoy( {headers : req.headers} ) ;

    let imageFileName ;
    let imgToBeUploaded
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        // check type file is img 
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({error : "image only"})
        }

        //my.img.png
        const imageExtension = filename.split('.')[ filename.split('.').length - 1 ] ;
        //123412.png
        imageFileName = `${Math.round(Math.random() * 10000000 )}.${imageExtension}` ;
        
        const filePath = path.join(os.tmpdir(), imageFileName) ;
        imgToBeUploaded = { filePath , mimetype } ;

        file.pipe( fs.createWriteStream (filePath)) ;
    })

    busboy.on( 'finish' , () => {
        db.admin.storage().bucket.upload(imgToBeUploaded.fieldPath, {
            resumable: false , 
            metadata : {
                metadata: {
                    contentType: imgToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            const imgUrl = `https://firebasestorage.googleapi.com/v0/${config.storageBucket}/o/${imageFileName}?alt=media`
            return db.doc(`users/${req.user.handle}`)
                .update({imgUrl : imgUrl}) ; 
        })
        .then(() => {
            return res.json({
                message : 'img uploaded successfully'
            })
        })
        .catch(err => {

        })
    }) ;
    busboy.end(req.rawBody) ;
}

//add user detail
exports.addUserDetail = (req, res) => {
    let userDetail = reduceUserDetail(req.body) ;

    db.doc(`users/${req.user.handle}`).update(userDetail) //will only update the field that have the information, other stay the same if dont have
        .then( () => {
            return res.json( { message : "Information added successfully" }) ;
        } )
        .catch( err => {
            return res.status(500).json({err : "Can't update user"}) ;
        })
}

// fetch info of logged in user = > FE will save this to REDUX for later
exports.getAuthenticatedUser = (req, res) => {
    let userData = {} ; // credentials and Likes
    
    db.doc(`{users/${req.user.handle}}`).get()
        .then( doc => {
            if (doc.exists) {
                userData.credentials= doc.data() ;
                return db.collection('likes')
                    .where('userHandle', '==' , req.user.handle)
                    .get();
            }
        })
        .then((data) => {
            userData.likes = [] ;
            data.forEach( doc => {
                userData.likes.push(doc.data())
            }) ;
            return res.json(userData) ;
        })
        .catch (err=> {
            res.status(500).json({err: err.code}) ;
        })
}
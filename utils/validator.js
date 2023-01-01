const isEmpty = (str) => {
    (!str || str.length === 0 );
} 

const isEmail = (str) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str))
  {
    return (true)
  }
    return (false)
}

const validateNewUser = (newUser) => {
    let errors = {}
    let isValid = false ;

    //validate input field: 
    if(isEmpty(newUser.handle)) {
        errors.push("handle must not be empty")
    } 
    if (!isEmail(newUser.email)) {
        errors.push("Enter valid email")
    } 
    if (isEmpty(newUser.password)) {
        errors.push("password cannot be empty")
    } 
    if (newUser.confirmPassword !== newUser.password) {
        errors.push("password not match");
    }

    isValid = Object.keys(errors).length > 0 ? false : true;
    return {isValid, errors}
}

const validateLogInUser = (user) => {
    let errors = {}
    let isValid = false ;

    //validate input field: 
    if(isEmpty(user.password)) {
        errors.push("handle must not be empty")
    } 
    if (!isEmail(user.email)) {
        errors.push("Enter valid email")
    } 

    isValid = Object.keys(errors).length > 0 ? false : true;
    return {isValid, errors}
}

const reduceUserDetail = (data) => {
    let UserDetail = {}

    if (!isEmpty(data.bio.trim())) UserDetail.bio = data.bio ;
    if (!isEmpty(data.website.trim())) UserDetail.website = data.website ;
    if (!isEmpty(data.location.trim())) UserDetail.location = data.location ;

    return UserDetail ;
}

module.exports = {validateNewUser, validateLogInUser , reduceUserDetail} ;
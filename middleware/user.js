const jwt=require('jsonwebtoken');

const fetchUser = async (req, res, next) => {

    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "please authenticate using valid token" });
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;                                  //data object addtion
            next();
        }
        catch (err) {

            res.status(401).send({ errors: "please authenticate using valid -token" });
        }
    }
}

module.exports=fetchUser;
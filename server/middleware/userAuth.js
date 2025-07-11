import jwt from 'jsonwebtoken'


const userAuth = async (req, res, next) => {
    // Safely get token from cookies (requires cookie-parser middleware)
    const {token} = req.cookies;


    if (!token) {
        return res.json({ success: false, message: "Not authorized , try to login Again" });
    }

    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);
        if(tokenDecode.id){
            req.body = req.body || {}; // usualy in get req.body is notsent so it undefined so we changes it to object => it not recomded to mutate req.body directly, but for this case we are adding userId so
            req.body.userId = tokenDecode.id;
        }else{
            return res.json({success:false, message:"Invalid Token"});
        }

        next();


    } catch (error) {
        return res.json({success:false, message:error.message});
    }
}

export default userAuth;
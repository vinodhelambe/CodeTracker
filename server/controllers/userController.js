import userModel from "../model/userModel.js";

export const getUserData = async (req, res)=>{
    const { userId } = req.body;

    if(!userId){
        return res.json({success:false, message:"Login First"})
    }
    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false})
        }
        return res.json({success:true, userdata : {name : user.name, IsAccountVerified: user.IsAccountVerified}});
    }catch(error){
        return res.json({success : false, message : error.message});
    }
}

export default getUserData;
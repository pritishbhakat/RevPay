import { Business } from "../models/business.model.js";
import { options } from "../constants/index.js";

const registerBusiness = async(req,res) => {

    const {username, password} = req.body;

    try {
        if(!username){
            return res.status(400).json({message:"username is required."})
        }
    
        if(!password){
            return res.status(400).json({message:"Password is required."})
        }
    
        const existingBusiness = await Business.findOne({username});
    
        if(existingBusiness) {
            return res.status(400).json({message:"Business already exists."})
        }
    
        const business = new Business({username, password});
        await business.save();
        res.status(201).json({message: "Business created successfully."});
    } catch (error) {
        console.log("Error while creating business:",error.message);
        res.status(500).json({message: "Internal server error."});
    }


} 

const loginBusiness = async(req,res) => {
  try {
      const {username, password} = req.body;
  
      if (!username){
          res.status(400).json({message:"Username is required."})
      }
  
      if (!password){
          res.status(400).json({message:"Password is required."})
      }
  
      const business = await Business.findOne({username});
  
      if(!business){
          return res.status(400).json({message:"Business does not exist."})
      }
  
      const isPasswordValid = await business.isPasswordCorrect(password);
  
      if(! isPasswordValid){
          return res.status(400).json({message:"Invalid password."})
      }
  
      const accessToken = await business.generateAccessToken();
  
      const loggedInBusiness = await Business.findById(business._id).select("-password");
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json({
          business: loggedInBusiness,
          accessToken,
          message: "Business logged in successfully.",
  
      })
  } catch (error) {
    console.log("Error while loging in business:",error.message);
    res.status(500).json({message: "Internal server error."});
  }




}

const logoutBusiness = async(req,res) => {
    try {
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .json({message: "Business logged out successfully."});

    } catch (error) {
        console.log("Error while loging out business:",error.message);
        res.status(500).json({message: "Internal server error."});
    }
}


export { registerBusiness, loginBusiness, logoutBusiness }
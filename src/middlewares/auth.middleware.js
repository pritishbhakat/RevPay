import { Business } from "../models/business.model.js";
import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  
    const token = req.cookies?.accessToken;
    if(!token) return res.status(401).send({message:'Access denied. No token provided.'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const business = await Business.findById(decoded._id).select('-password');
        if(!business){
            return res.status(401).send({message:'Unauthorized access'});
        }
        req.business = business;
        next()
    } catch (error) {
        console.log('Error while verifying token: ', error.message);
        return res.status(401).send({message:'Access denied. Invalid token.'});
    }

}

export { verifyToken };
import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
    // get the token from the cookies
    const token = req.cookies.access_token;

    //if token is missing, return an error
    if (!token) {
        return next(errorHandler(401, 'Unauthorized'));
    }

    // verify the token with the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(403, 'Forbidden'));
        }

        // set the user in the request object so it can be accessed in the next middleware
        req.user = user;
        console.log(user);
        next();
    });
};

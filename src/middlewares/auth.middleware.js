import jwt from "jsonwebtoken";  // Add this import statement
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", ""); // Add a space after 'Bearer'
    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }
    
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Use jwt.verify
    const user = await User.findById(decodedToken?._id).select("-Password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

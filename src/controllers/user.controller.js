import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  const { FullName, email, username, Password } = req.body;

  console.log("email:", email);

  if (
    [FullName, email, username, Password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (!existedUser) {
    throw new ApiError(409, "user with email or username already exsists");
  }

  const avatarLocalPath=req.files?.avatar[0]?.path;   //req.files kya avatar ki phle chij hai agar hai toh ky path hai uska
  const coverImageLocalPath=req.files?.coverImage[0]?.path;
  if(!avatarLocalPath){
    throw new ApiError(404,"Avatar file is required !")

  } 
  const avatar=await uploadOnCloudinary(avatarLocalPath);
  const coverImage=await uploadOnCloudinary(coverImage);
  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }
  const user=await User.create({
    FullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",   //coverimage mandatory ni hai
    email,
    Password,
    username:username.toLowerCase()

  })
  const createdUser=await User.findById(user._id).select("-Password -refreshToken")
  if (!createdUser){
    throw new ApiError("500","something went wrong after registering the user")
  }
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )
});

export { registerUser };

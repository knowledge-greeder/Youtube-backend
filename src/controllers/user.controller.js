import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"; 
const registerUser = asyncHandler(async (req, res) => {
  const { FullName, email, username, Password } = req.body;

  console.log("email:", email);

  if (
    [FullName, email, username, Password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exsists");
  }
console.log("here is files",req.files)
  const avatarLocalPath=req.files?.avatar[0]?.path;   //req.files kya avatar ki phle chij hai agar hai toh ky path hai uska
  console.log("avatarLocalPath",avatarLocalPath)
  // const coverImageLocalPath=req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files)&& req.files.length > 0){
    coverImageLocalPath=req.files.coverImage[0].path
  }
  if(!avatarLocalPath){
    throw new ApiError(404,"Avatar file is required !")

  } 
  const avatar=await uploadOnCloudinary(avatarLocalPath);
  console.log("avatar",avatar)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath);
  console.log("coverImage",coverImage)
  if(!avatar){
    throw new ApiError(400,"Avatar file is required while submitting on cloudinary")
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

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log("User found:", user);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // saving refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    console.log("Refresh token saved:", user.refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "SOMETHING WENT WRONG ON GENERATING ACCESS AND REFRESH TOKENS");
  }
};

const loginUser=asyncHandler(async(req,res)=>{
const {email,Password,username}=req.body
if (!(username || email)){
  throw new ApiError(400,"username or email is required")
}

const user=await User.findOne({
  $or: [{username},{email}]
})
if (!user){
  throw new ApiError(400,"USER doesn't exsist")
}

const isPasswordValid=await user.isPasswordCorrect(Password)
if (!isPasswordValid){
  throw new ApiError(400,"enter correct credentails")
}
const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
const loggedInuser = await User.findById(user._id).select("-Password -refreshToken" )
const options={
  httpOnly: true,
  secure:true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(new ApiResponse(200,
  {
    user:loggedInuser,accessToken,refreshToken           //genrally doing for mobile applicaton
  },
  "User loggedin Successfully!"
))
})

const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(req.user._id,
  {
    $set:{
      refreshToken: undefined
    }
  },
  {
    new:true
  }
)
const options={
  httpOnly: true,
  secure:true
}
return res.status(200)
.clearCookie(accessToken,options)
.clearCookie(refreshToken,options)
.json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken  //cookies s utha loh refresh token ni toh body s utha loh

  if (!incomingRefreshToken){
    throw new ApiError(401,"unauthorised req")
  }
  try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id)
    if(!user)
      {
        throw new ApiError(401,"invalid refresh token")
      }
    if(incomingRefreshToken !==user?.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
    }
    const options={
      httpOnly:true,
      secure:true
    }
    const {accessToken,newrefreshToken} =await generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new ApiResponse(200,{accessToken,refreshToken:newrefreshToken},"Access token refreshed")
    )
  } catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh token")
  }
})
export { registerUser ,loginUser,logoutUser,refreshAccessToken};

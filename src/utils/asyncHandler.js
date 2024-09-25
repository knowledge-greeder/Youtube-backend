const asyncHandler=(requestHandler)=>{
    return(req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}




// // const asyncHandler=(fn)=>async(req,res,next)=>{
// //     try{
// //         await fn(res,req,next)
// //     }
// //     catch(err){
// //         res.statu(err.code || 500).json({
// //             success: false,
// //             message: err.message
// //         })
// //     }

// }
export {asyncHandler}
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

import { ApiResponse } from '../utils/apiResponse.js';

const userRegister = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // validate request body
  if (
    [fullName, email, username, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  // check user existence
  const existedUser = User.findOne({
    $or: [{ email: email.trim() }, { username: username.trim() }],
  });

  if (existedUser) {
    throw new ApiError(409, 'User already exists with this email or username');
  }

  // upload images on cloudinary
  const avatarImagePath = req.files.avatar[0]?.path;
  const coverImagePath = req.files.coverImage[0]?.path;

  if (!avatarImagePath) {
    throw new ApiError(400, 'Avatar image is required');
  }

  const avatarPath = await uploadOnCloudinary(avatarImagePath);
  const coverPath = await uploadOnCloudinary(coverImagePath);

  if (!avatarPath) {
    throw new ApiError(400, 'Avatar image is required');
  }

  // create user
  const user = await User.create({
    fullName,
    email: email.trim().toLowerCase(),
    username: username.trim().toLowerCase(),
    password,
    avatar: avatarPath.url,
    coverImage: coverPath?.url || '',
  });
  // find the created user without password and refreshToken
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  // validate user creation
  if (!createdUser) {
    throw new ApiError(500, 'User registration failed');
  }

  return res.status(201).json(
    new ApiResponse(200, 'User registered successfully', createdUser)
  );
});

export { userRegister };

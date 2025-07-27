import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

import { ApiResponse } from '../utils/apiResponse.js';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Failed to generate tokens');
  }
};

// register user
const userRegister = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // validate request body
  if (
    [fullName, email, username, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  // check user existence
  const existedUser = await User.findOne({
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

  return res
    .status(201)
    .json(new ApiResponse(200, 'User registered successfully', createdUser));
});

// login user
const userLogin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // console.log(email,password);

  // validate request body
  if (!username && !email) {
    throw new ApiError(400, 'Username and email are required');
  }

  if (!(username || email)) {
    throw new ApiError(400, 'Username and email are required');
  }

  // check if user exists
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(user);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  // validate password
  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password');
  }
  // generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // userlogin response
  const userLoggedIn = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, 'User loggedIn successfully', {
        user: userLoggedIn,
        accessToken,
        refreshToken,
      })
    );
});

const userLogout = asyncHandler(async (req, res) => {
  // find and update user to remove refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export { userRegister, userLogin, userLogout };

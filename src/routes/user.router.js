import {Router} from 'express';
import { refreshAccessToken, userLogin, userLogout, userRegister } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();

// register route
router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    userRegister
);

// login route
router.route("/login").post(userLogin);

// secure route
router.route("/logout").post(verifyJWT, userLogout);

//refresh token route

router.route("/refresh-token").post(refreshAccessToken);


export default router;
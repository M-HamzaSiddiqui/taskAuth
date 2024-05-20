import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import userSchema from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
    createTable,
    checkRecordExists,
    insertRecord,
    updatePassword
} from "../utils/sqlFunctions.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/mailer.js";

const generateAccessToken = (userId, email, username) => {
    console.log(userId);
    return jwt.sign({ userId, email, username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

const generateResetToken = (email) => {
    return jwt.sign({ email }, process.env.RESET_TOKEN_SECRET, { expiresIn: process.env.RESET_TOKEN_EXPIRY });
};

const registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        throw new ApiError(400, "All fields are required");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
        userId: uuidv4(),
        email,
        username,
        password: hashedPassword
    };

    try {
        const result = await createTable(userSchema);
        const userAlreadyExists = await checkRecordExists("users", "email", email);
        console.log(userAlreadyExists.length);

        if (userAlreadyExists.length) {
            throw new ApiError(409, "User with this email already exists");
        }

        await insertRecord("users", user);
        return res.status(200).json(new ApiResponse(200, "user created successfully"));
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message
        });
    }


};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(409, "Email or password missing. Please enter both");
    }

    try {
        const existingUser = await checkRecordExists("users", "email", email);

        if (!existingUser) {
            return res.status(401).json({
                error: "User does not exist. Please register first."
            });
        }

        console.log("existing user", existingUser);

        const passwordMatched = await bcrypt.compare(password, existingUser[0].password);
        if (!passwordMatched) {
            return res.status(401).json({
                error: "password or email is incorrect"
            });
        }

        const accessToken = generateAccessToken(existingUser[0].userId, existingUser[0].email, existingUser[0].username);

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(200, {
                user: existingUser,
                accessToken
            },
                "User logged in successfully"
            ));


    } catch (error) {
        console.log("Error logging in:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }

};

const tokenValidation = async (req, res) => {
    const token = req.cookies.accessToken;
    console.log(token);
    const validToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(validToken.userId);

    if (!validToken) {
        return res.status(400).json({
            error: "Invalid access token"
        });
    }

    const { userId, email, username } = validToken;
    const userInfo = {
        userId,
        email,
        username
    };
    const user = await checkRecordExists("users", "email", email);
    console.log(user);
    return res
        .status(200)
        .json(new ApiResponse(200, userInfo, "UserInfo retrieved successfully"));


};

const forgetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    console.log("email fp", email);

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const existingUser = await checkRecordExists("users", "email", email);

    if (!existingUser) {
        return res.status(400).json({ "error": "Invalid email" });
    }

    const hashedToken = generateResetToken(email);

    // send this to users email in link as a param
    console.log("emaema", email);
    await sendEmail({ hashedToken, email, newPassword });

    return res.status(200).json({ message: "Password reset email send" });
};

const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.query;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const data = {
            password: hashedPassword,
            email
        };

        console.log("before");
        console.log(token);
        const validToken = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
        console.log("after");

        if (!validToken) {
            return res.status(404).json({ "error": "invalid token or token expired" });
        }

        await updatePassword("users", hashedPassword, email);

        return res.status(200).json({ "message": "Password reset successful" });

    } catch (error) {
        console.log(error);
    }
};



export { registerUser, loginUser, tokenValidation, forgetPassword, resetPassword };

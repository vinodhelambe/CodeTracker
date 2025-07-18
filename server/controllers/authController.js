import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../model/userModel.js';
import transporter from '../config/nodeMailer.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing data" });
    }

    try {

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User Alredy exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const Token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7D' });

        res.cookie('token', Token, {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SenderEmail,
            to: email,
            subject: 'Welcome buddy',
            text: `hey buddy! ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password is required" });
    }

    try {

        const User = await userModel.findOne({ email });

        if (!User) {
            return res.json({ success: false, message: "User Does't exists" });
        }

        const IsMatch = await bcrypt.compare(password, User.password);

        if (!IsMatch) {
            return res.json({ success: false, message: "Password Invalid" })
        }

        const Token = jwt.sign({ id: User._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', Token, {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: "Logged Out" })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        // Find user by ID
        const user = await userModel.findById(userId);

        if (user.IsAccountVerified) {
            return res.json({ success: false, message: "account alredy verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SenderEmail,
            to: user.email,
            subject: 'Verification mail',
            text: `Your otp is ${otp}. Verify your account using this otp.`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing data" });
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid otp" });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "otp expired" });
        }
        user.IsAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Account verified successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}



export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SenderEmail,
            to: email,
            subject: 'Reset Password otp',
            text: `Your otp for password reset is ${otp}.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { otp, newPassword, email } = req.body;

    if (!otp || !newPassword) {
        return res.json({ success: false, message: "Missing data" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid otp" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "otp expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
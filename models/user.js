const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { createTokenForUser } = require("../config/auth");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: String,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    profileImageUrl: {
      type: String,
      default: "../public/images/avatar_image.png",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.salt = bcrypt.genSaltSync(10).toString();
    this.password = bcrypt.hashSync(this.password, this.salt);
  }
  next();
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedPass = bcrypt.hashSync(password, salt);
    if (userProvidedPass !== hashedPassword)
      throw new Error("Invalid password");

    const token = createTokenForUser(user);
    return token;
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
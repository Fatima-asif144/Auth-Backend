const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [60, "Name must be 60 characters or fewer."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select: false, // never returned in queries unless we ask for it
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [160, "Bio must be 160 characters or fewer."],
      default: "",
    },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Hash the password before saving (only when it was changed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

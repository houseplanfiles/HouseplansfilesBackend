const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Notification = require("./notificationModel");

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["user", "professional", "seller", "Contractor", "admin"],
    },
    name: { type: String },
    isApproved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    photoUrl: { type: String },
    profession: { type: String },
    businessCertificationUrl: { type: String },
    shopImageUrl: { type: String },
    city: { type: String },
    address: { type: String },
    experience: { type: String },
    businessName: { type: String },
    materialType: { type: String },
    companyName: { type: String },
    contractorType: {
      type: String,
      enum: ["Normal", "Verified", "Premium"],
      default: "Normal",
    },
    premiumExpiresAt: { type: Date, default: null },

    // --- NEW: Contractor Detailed Profile (For Premium) ---
    coverPhotoUrl: { type: String },
    packages: [
      {
        name: { type: String },
        price: { type: String },
        description: { type: String },
      },
    ],
    workSamples: [
      {
        title: { type: String },
        description: { type: String },
        location: { type: String },
        imageUrl: { type: String },
        images: [{ type: String }],
        features: [{ type: String }],
        reviews: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            name: { type: String },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
          },
        ],
        seo: {
          title: { type: String, default: "" },
          description: { type: String, default: "" },
          keywords: [{ type: String }],
        },
      },
    ],

    // --- NEW: Professional Bank & Payment Details ---
    bankName: { type: String }, // <--- ADDED: Bank Name Field
    bankAccountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String },
    portfolioUrl: { type: String }, // Portfolio PDF URL

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.post("save", async function (doc, next) {
  if (this.isNew) {
    try {
      await Notification.create({
        message: `New ${doc.role} registered: ${doc.name || doc.email}`,
        type: "NEW_USER",
        link: "/admin/users",
      });
    } catch (error) {
      console.error("Failed to create notification for new user:", error);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

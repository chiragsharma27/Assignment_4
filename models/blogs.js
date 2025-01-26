const { mongoose, Schema } = require("mongoose");
const crypto = require("crypto");

// Define the schema
const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Blog description is required"],
      trim: true,
    },
    slugName: {
      type: String,
      unique: true, 
    },

    thumbnailImage: {
      type: String,
      required: [true, "Thumbnail image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

blogSchema.pre("save", async function (next) {
  if (!this.slug) {
    const generateUniqueSlug = async () => {
      let slug;
      let isUnique = false;
      while (!isUnique) {
        slug = crypto.randomBytes(6).toString("hex");
        const existingBlog = await mongoose.model("Blog").findOne({ slug });
        isUnique = !existingBlog;
      }
      return slug;
    };

    this.slug = await generateUniqueSlug();
  }
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
import mongoose from "mongoose";
import validate from "mongoose-validator";
mongoose.set("useCreateIndex", true);

const productSchema = mongoose.Schema({
  type: String,
  name: String,
  company: String,
  service: ObjectId,
  tag: String,
  price: Number,
  status: Boolean,
  otherProduct: ObjectId,
  updated: { type: Date, default: Date.now },
});

const productModel = mongoose.model("Product", productSchema);

export default productModel;

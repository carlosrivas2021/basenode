import mongoose from "mongoose";
import validate from "mongoose-validator";
mongoose.set("useCreateIndex", true);

const serviceSchema = mongoose.Schema({
  type: String,
  name: String,
  company: String,
  products: {
    type: [],
    default: []
  },
  tag: String,
  status: Boolean,
  updated: { type: Date, default: Date.now },
});



const serviceModel = mongoose.model("Service", serviceSchema);

export default serviceModel;

import mongoose from "mongoose";
import validate from "mongoose-validator";
mongoose.set("useCreateIndex", true);

const userSchema = mongoose.Schema({
  idfacebook: String,
  idgoogle: String,
  // username: {
  //   type: String,
  //   unique: true,
  //   required: [true, "El campo de usuario es requerido"],
  //   validate: [
  //     validate({
  //       validator: "isLength",
  //       arguments: [6, 8],
  //       message:
  //         "El nombre de usuario debe contener entre {ARGS[0]} y {ARGS[1]}"
  //     }),
  //     validate({
  //       validator: "isAlphanumeric",
  //       message: "El nombre de usuario debe ser alfanumérico"
  //     })
  //   ]
  // },
  password: {
    type: String,
    bcrypt: true,
    validate: validate({
      validator: "isLength",
      arguments: [8],
      message: "La contraseña debe contener mas de {ARGS[0]} caracteres."
    })
  },
  fullname: String,
  desc: String,
  bio: String,
  email: {
    type: String,
    validate: validate({
      validator: "isEmail",
      message: "Introduce un email valido"
    })
  },
  photo: String,
  phone: {
    type: String,
    unique: true
  },
  addresses: {
    type: [],
    default: []
  },
  favorites: {
    type: [],
    default: []
  },
  type: String
});

userSchema.plugin(require("mongoose-bcrypt", { rounds: 10 }));

const userModel = mongoose.model("User", userSchema);

export default userModel;

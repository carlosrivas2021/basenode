import auth from "../auth";
import { isAuthenticatedResolver } from "../permissions";
import fs from "fs";
import mkdirp from "mkdirp";
import shortid from "shortid";
import { GraphQLUpload } from "apollo-upload-server";

const uploadDir = "/src/uploads";

mkdirp.sync("." + uploadDir);

const storeFS = ({ stream, filename }) => {
  const id = shortid.generate();
  const path = `${uploadDir}/${id}-${filename}`;
  return new Promise((resolve, reject) =>
    stream
      .on("error", error => {
        if (stream.truncated) fs.unlinkSync("." + path);
        reject(error);
      })
      .pipe(fs.createWriteStream("." + path))
      .on("error", error => reject(error))
      .on("finish", () => resolve({ id, path }))
  );
};

const processUpload = async upload => {
  const { createReadStream, filename, mimetype, encoding } = await upload;
  const stream = createReadStream();
  const { id, path } = await storeFS({ stream, filename });
  return { id, filename, mimetype, encoding, path };
};

const formatErrors = error => {
  const errors = error.errors;
  const objErrors = [];

  if (errors) {
    Object.entries(errors).map(error => {
      const { path, message } = error[1];
      objErrors.push({ path, message });
    });
    return objErrors;
  }

  const unknownError = {};
  // console.log(error.message);

  switch (error.code) {
    case 11000:
      if (error.message.indexOf("username") != -1) {
        unknownError.path = "username";
        unknownError.message = "El nombre de usuario ya existe";
      }
      if (error.message.indexOf("email") != -1) {
        unknownError.path = "email";
        unknownError.message = "El email ya existe";
      }

      break;

    default:
      unknownError.path = "desconocido";
      unknownError.message = error.message;
      break;
  }

  return [unknownError];
};

export default {
  Upload: GraphQLUpload,
  Query: {
    allUsers: isAuthenticatedResolver.createResolver(
      (parent, args, { models }) => models.User.find()
    ),
    getUser: (parent, args, { models }) => models.User.findOne(args),
    me: (parent, args, { models, user }) => models.User.findById({ _id: user })
  },
  Mutation: {
    login: async (parent, { email, password }, { models: { User } }) =>
      auth.login(email, password, User),
    loginf: async (parent, { facebook, type }, { models: { User } }) =>
      auth.login(facebook.id, facebook.id, User, facebook, null, type),
    loging: async (parent, { google, type }, { models: { User } }) =>
      auth.login(facebook.id, facebook.id, User, null, google, type),
    createUser: async (parent, args, { models }) => {
      //return models.User.create(args)
      try {
        // const hashPassword = await bcrypt.hash(password, 10);
        const u = await models.User.findOne({ email: args.email, type: args.type }); 
        if(u){
          return {
            success: false,
            errors: [{
              path: "createUser",
              message: "El email ya existe para esta aplicación"
            }]
          };
        }
        const user = await models.User.create(args);
        return {
          success: true,
          errors: []
        };
      } catch (error) {
        // console.log(error);
        return {
          success: false,
          errors: formatErrors(error)
        };
      }
    },
    singleUpload: (obj, { file }) => processUpload(file)
  }
};

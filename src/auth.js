import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import models from "./models";

const auth = {
  checkHeaders: async (req, res, next) => {
    const token = req.headers["x-token"];

    if (token) {
      try {
        const { user } = jwt.verify(token, process.env.SECRET);
        req.user = user;
      } catch (e) {
        //Token invalido
        const newToken = await auth.checkToken(token);
        req.user = newToken.user;
        if (newToken.token) {
          res.set("Access-Control-Expose-Headers", "x-token");
          res.set("x-token", newToken.token);
        }
      }
    }
    next();
  },
  checkToken: async token => {
    let idUser = null;
    try {
      const { user } = await jwt.decode(token);
      idUser = user;
    } catch (e) {
      return {};
    }
    const user = await models.User.findOne({ _id: idUser });

    const [newToken] = auth.getToken(user);
    // console.log(newToken);
    return {
      user: user._id,
      token: newToken
    };
  },
  getToken: ({ _id }) => {
    const newToken = jwt.sign({ user: _id }, process.env.SECRET, {
      expiresIn: "100s"
    });

    return [newToken];
  },
  login: async (
    email,
    password,
    User,
    facebook = null,
    google = null,
    type = null
  ) => {
    var user;
    if(type!='user'&&type!='employed'&&type!='company'){
      return {
        success: false,
        errors: [{ path: "type", message: "Type no permitido" }]
      };
    }
    if (facebook) {
      user = await models.User.findOne({ idfacebook: facebook.id, type });
      if (!user) {
        
        user = new models.User({
          idfacebook: facebook.id,
          fullname: facebook.displayName,
          email: `${facebook.id}@id.com`,
          type
        });
        await user.save();
      }
    } else if (google) {
      user = await models.User.findOne({ idgoogle: google.id, type });
      if (!user) {
        user = new models.User({
          idgoogle: google.id,
          fullname: google.displayName,
          email: google.emails[0].value,
          type
        });
        await user.save();
      }
    } else {
      user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          errors: [{ path: "email", message: "Email no existe" }]
        };
      }

      // const validPassword = await bcrypt.compare(password, user.password);

      // if(!validPassword){
      //     return {
      //         success: false,
      //         errors: [{path: 'password', message: 'Password inválido'}]
      //     }
      // }

      if (!(await user.verifyPassword(password))) {
        return {
          sucess: false,
          errors: [{ path: "password", message: "pasword invalido." }]
        };
      }
    }

    const [newToken] = await auth.getToken(user);

    // console.log(newToken);
    return {
      success: true,
      token: newToken,
      errors: []
    };
  }
};

export default auth;

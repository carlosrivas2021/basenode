import express from "express";
import secure from "express-force-https";
import graphqlHTTP from "express-graphql";
import { createServer } from "http";
import { fileLoader, mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import { makeExecutableSchema } from "graphql-tools";
import path from "path";
import cors from "cors";
import "dotenv/config";
import { apolloUploadExpress } from "apollo-upload-server";
import passport from "passport";
import FacebookStrategy from "passport-facebook";
import GoogleAuth from "passport-google-oauth20";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";

// import schema from "./schema";
import { connect } from "./database";
import models from "./models";
import auth from "./auth";

const app = express();
app.use(secure);
connect();
// const GoogleStrategy = GoogleAuth.Strategy;
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: process.env.FACEBOOK_APP_CALLBACKURL
//     },
//     async function(accessToken, refreshToken, profile, cb) {
//       // console.log(profile.displayName);
//       return cb(null, profile);
//     }
//   )
// );

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CLIENT_CALLBACKURL
//     },
//     function(accessToken, refreshToken, profile, cb) {
//       console.log(profile);
//       return cb(null, profile);
//     }
//   )
// );

// app.use(passport.initialize());

// app.get("/flogin", passport.authenticate("facebook"));

// app.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", { session: false }),
//   async function(req, res) {
//     // console.log(req.user);

//     const resp = await auth.login(
//       req.user.id,
//       req.user.id,
//       models.User,
//       req.user
//     );
//     console.log(resp);
//     res.json(resp);
//   }
// );

// app.get(
//   "/glogin",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { session: false }),
//   async function(req, res) {
//     // Successful authentication, redirect home.
//     const resp = await auth.login(
//       req.user.id,
//       req.user.id,
//       models.User,
//       null,
//       req.user
//     );
//     console.log(resp);
//     res.json(resp);
//   }
// );

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./types")));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "./resolvers"))
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
const PORT = 3000;
const WS_GQL_PATH = "/subscriptions";

app.use(
  cors({
    origin: ["*"]
  })
);

app.use(auth.checkHeaders);

app.get("/", async (req, res) => {
  // const user = await models.User.findOne({ idfacebook: "idfacebook" });
  // console.log(user);
  res.json({
    message: "Hello word"
  });
});

app.use(
  "/graphql",
  apolloUploadExpress(),
  graphqlHTTP(req => ({
    graphiql: true,
    schema,
    context: {
      models,
      user: req.user
    }
  }))
);

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
  console.log(
    `API Server over web socket with subscriptions is now running on ws://localhost:${PORT}${WS_GQL_PATH}`
  );
});

new SubscriptionServer(
  { schema, execute, subscribe },
  { server, path: WS_GQL_PATH }
);

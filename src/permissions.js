import { createResolver } from "apollo-resolvers";

export const baseResolver = createResolver(
  null,
  (root, args, context, error) => error
);

export const isAuthenticatedResolver = baseResolver.createResolver(
  (root, args, { user }) => {
    if (!user) throw new Error("No autenticado");
  }
);

import { PubSub, withFilter } from "graphql-subscriptions";
const chats = [];
const CHAT_CHANNEL = "CHAT_CHANNEL";
const pubsub = new PubSub();
export default {
  Query: {
    chats(root, args, context) {
      return chats;
    }
  },

  Mutation: {
    sendMessage(root, { from, message }) {
      const chat = { id: chats.length + 1, from, message };

      chats.push(chat);
      pubsub.publish("CHAT_CHANNEL", { messageSent: chat });

      return chat;
    }
  },

  Subscription: {
    messageSent: {
      subscribe: () => {
        return pubsub.asyncIterator(CHAT_CHANNEL);
      }
    }
  }
};

const resolvers = {};

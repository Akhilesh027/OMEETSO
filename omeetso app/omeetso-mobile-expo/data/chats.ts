import type { Chat } from "../types";

export const chats: Chat[] = [
  {
    id: "c1",
    productId: "p1",
    peerId: "u1",
    peerName: "Rahul K.",
    lastMessage: "Is the price negotiable?",
    updatedAt: Date.now() - 1000 * 60 * 20,
    unread: 2,
  },
  {
    id: "c2",
    productId: "p3",
    peerId: "u3",
    peerName: "Home Store",
    lastMessage: "We can deliver in Kondapur today.",
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    unread: 0,
  },
];

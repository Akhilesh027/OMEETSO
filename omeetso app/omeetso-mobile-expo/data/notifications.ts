import type { Notification } from "../types";

export const notifications: Notification[] = [
  { id: "n1", title: "New offer received", body: "Rahul offered ₹92,000 for your iPhone 15 Pro.", createdAt: Date.now() - 1000 * 60 * 15, read: false, category: "offer" },
  { id: "n2", title: "Message from Home Store", body: "We can deliver in Kondapur today.", createdAt: Date.now() - 1000 * 60 * 60 * 2, read: false, category: "message" },
  { id: "n3", title: "Listing approved", body: "Your MacBook Air M2 is now live.", createdAt: Date.now() - 1000 * 60 * 60 * 5, read: true, category: "listing" },
];

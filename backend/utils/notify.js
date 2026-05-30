const Notification = require('../models/Notification');

/**
 * Create a notification for a single user.
 */
const notifyUser = (userId, { title, message = '', type = 'info', link = '' }) =>
  Notification.create({ user: userId, title, message, type, link });

/**
 * Create the same notification for many users (bulk).
 */
const notifyUsers = (userIds = [], payload) =>
  Notification.insertMany(
    userIds.map((user) => ({ user, ...payload }))
  );

module.exports = { notifyUser, notifyUsers };

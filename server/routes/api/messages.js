const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const { onlineUsers } = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      // security check making sure the sender is part of the conversation
      let conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: {
            user1Id: senderId,
            user2Id: senderId,
          },
        }
      })

      if (!conversation) {
        return res.sendStatus(403)
      }

      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.has(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

// update all unread message from other user to read for a given conversation
router.put("/read", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { senderId, conversationId } = req.body

    await Message.update(
      {
        read: true
      },
      {
        where: {
          conversationId: conversationId,
          senderId: senderId,
          read: false,
        },
      }
    );
    return res.sendStatus(204)
  } catch (error) {
    next(error);
  }
})

module.exports = router;

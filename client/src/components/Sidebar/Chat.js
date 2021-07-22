import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { setActiveChat } from "../../store/activeConversation";
import { updateReadMessage } from "../../store/utils/thunkCreators";
import { useDispatch } from "react-redux";

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
}));

const Chat = (props) => {
  const dispatch = useDispatch();
  const setActive = (id) => {
    dispatch(setActiveChat(id));
  }
  const updateRead = (conversation) => {
    dispatch(updateReadMessage(conversation))
  }

  const classes = useStyles();

  const handleClick = async (conversation) => {
    await setActive(conversation.otherUser.username);
    await updateRead(conversation);
  };

  const otherUser = props.conversation.otherUser;
  return (
    <Box
      onClick={() => handleClick(props.conversation)}
      className={classes.root}
    >
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={props.conversation} />
    </Box>
  );
};

export default Chat;

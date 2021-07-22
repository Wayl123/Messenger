import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { setActiveChat } from "../../store/activeConversation";
import { updateReadMessage } from "../../store/utils/thunkCreators";
import { connect } from "react-redux";

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
  const classes = useStyles();

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);
    await props.updateReadMessage(conversation);
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

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    updateReadMessage: (conversation) => {
      dispatch(updateReadMessage(conversation))
    },
  };
};

export default connect(null, mapDispatchToProps)(Chat);

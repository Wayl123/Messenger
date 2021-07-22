import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormControl, FilledInput } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { postMessage } from "../../store/utils/thunkCreators";
import { reorderConversation } from "../../store/conversations";

const useStyles = makeStyles(() => ({
  root: {
    justifySelf: "flex-end",
    marginTop: 15,
  },
  input: {
    height: 70,
    backgroundColor: "#F4F6FA",
    borderRadius: 8,
    marginBottom: 20,
  },
}));

const Input = (props) => {
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const postChat = (message) => {
    dispatch(postMessage(message));
  }
  const reorderChat= (conversationId) => {
    dispatch(reorderConversation(conversationId))
  }

  const classes = useStyles();
  const [text, setText] = useState("");

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // add sender user info if posting to a brand new convo, so that the other user will have access to username, profile pic, etc.
    const reqBody = {
      text: event.target.text.value,
      recipientId: props.otherUser.id,
      conversationId: props.conversationId,
      sender: props.conversationId ? null : user,
    };
    await postChat(reqBody);
    await reorderChat(props.conversationId);
    setText("");
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <FormControl fullWidth hiddenLabel>
        <FilledInput
          classes={{ root: classes.input }}
          disableUnderline
          placeholder="Type something..."
          value={text}
          name="text"
          onChange={handleChange}
        />
      </FormControl>
    </form>
  );
};

export default Input;

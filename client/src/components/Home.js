import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { SidebarContainer } from "./Sidebar";
import { ActiveChat } from "./ActiveChat";
import { logout, fetchConversations } from "../store/utils/thunkCreators";
import { clearOnLogout } from "../store/index";

const useStyles = makeStyles(() => ({
  root: {
    height: "97vh",
    maxHeight: "97vh",
  },
  logout: {
    maxHeight: "3vh",
  },
}));

const Home = () => {
  const user = useSelector((state) => state.user);
  
  const dispatch = useDispatch();
  const logoutClick = (id) => {
    dispatch(logout(id));
    dispatch(clearOnLogout());
  }
  const getConversations = (user) => {
    dispatch(fetchConversations(user));
  }

  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    getConversations(user)
  },[user]);

  useEffect(() => {
    setIsLoggedIn(true)
  },[user.id]);

  const handleLogout = async () => {
    await logoutClick(user.id);
  };

  if (!user.id) {
    // If we were previously logged in, redirect to login instead of register
    if (isLoggedIn) return <Redirect to="/login" />;
    return <Redirect to="/register" />;
  }

  return (
    <>
      {/* logout button will eventually be in a dropdown next to username */}
      <Button className={classes.logout} onClick={handleLogout}>
        Logout
      </Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer />
        <ActiveChat />
      </Grid>
    </>
  );
};

export default Home;

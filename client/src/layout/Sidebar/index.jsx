import {
  Avatar,
  Collapse,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { useEffect, useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import QuizIcon from "@mui/icons-material/Quiz";
import {
  Dashboard,
  BugReport,
  ExpandLess,
  ExpandMore,
  Person,
  EditNote,
  Class,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useUserContext from "~/hook/useUserContext";
import { handleUserOfflineFirebase } from "~/utils/firebase";

export default function Sidebar() {
  const nav = useNavigate();

  const [user, dispatch] = useUserContext();
  const [open, setOpen] = useState(() => {
    return localStorage.getItem("sidebar") === "true" ? true : false;
  });
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  const handleOpenSidebar = () => {
    setOpen(!open);
    localStorage.setItem("sidebar", !open);
  };

  const handleAdminDashBoard = () => {
    setAdminDashboardOpen(!adminDashboardOpen);
  };

  const handleAdminNav = (path) => {
    nav(`/admin/${path}`);
  };

  const handleLogout = async () => {
    handleUserOfflineFirebase(
      user._id,
      JSON.parse(localStorage.getItem("dataKey"))
    );
    dispatch({
      type: "LOGOUT",
    });
    nav("/auth/login");
  };

  useEffect(() => {
    window.addEventListener("click", (e) => {
      const btn = e.target.closest(".toggle-sidebar");
      const sidebar = e.target.closest(".sidebar");

      if (!btn && !sidebar) {
        setOpen(false);
      }
    });

    return () => {
      window.removeEventListener("click", () => {});
    };
  }, []);

  return (
    <List
      className="sidebar"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: 300,
        bgcolor: "#ccc",
        boxShadow: 2,
        transition: "all 0.3s ease",
        marginLeft: open ? 0 : "-300px",
        position: "fixed",
        inset: 0,
        zIndex: 100,
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          VNOI - HCM CITY OPEN UNIVERSITY
        </ListSubheader>
      }
    >
      <div>
        {user.role === "ADMIN" && (
          <>
            <ListItemButton onClick={() => handleAdminDashBoard()}>
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="ADMIN Dashboard" />
              {adminDashboardOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminDashboardOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  onClick={() => handleAdminNav("users")}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="User" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleAdminNav("problems")}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <BugReport />
                  </ListItemIcon>
                  <ListItemText primary="Problem" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleAdminNav("submissions")}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <EditNote />
                  </ListItemIcon>
                  <ListItemText primary="Submission" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleAdminNav("classes")}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <Class />
                  </ListItemIcon>
                  <ListItemText primary="Class" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        {user.role === "LECTURER" && (
          <ListItemButton onClick={() => nav("/lecturer/dashboard")}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        )}
        {import.meta.env.VITE_MODE === "development" && (
          <ListItemButton onClick={() => nav("/problems")}>
            <ListItemIcon>
              <BugReport />
            </ListItemIcon>
            <ListItemText primary="Problems" />
          </ListItemButton>
        )}
        <ListItemButton onClick={() => nav("/competition")}>
          <ListItemIcon>
            <QuizIcon />
          </ListItemIcon>
          <ListItemText primary="Competition" />
        </ListItemButton>
      </div>
      <div
        style={{
          marginTop: "auto",
        }}
      >
        <ListItem
          sx={{
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => nav("/profile/" + user?._id)}
        >
          <ListItemIcon>
            {user?.avatar ? (
              <Avatar alt="Remy Sharp" src={user.avatar} />
            ) : (
              <Avatar>{user?.fullName}</Avatar>
            )}
          </ListItemIcon>
          <ListItemText primary={user?.fullName || user.email} />
        </ListItem>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </div>
      <Fab
        className="toggle-sidebar"
        sx={{
          position: "absolute",
          top: "50%",

          right: 0,
          transform: "translate(50%, -50%)",
        }}
        onClick={handleOpenSidebar}
        color="primary"
        aria-label="add"
      ></Fab>
    </List>
  );
}

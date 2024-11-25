import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useState } from "react";
import StyledBadge from "../StyledBadge";

import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SearchIcon from "@mui/icons-material/Search";
import CallIcon from "@mui/icons-material/Call";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import InfoIcon from "@mui/icons-material/Info";
import Profile from "src/components/Profile";
import { useChat } from "src/contexts/ChatContext";

interface HeaderProps {
  openChatInfo: boolean;
  setOpenChatInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: FC<HeaderProps> = (props) => {
  const [openProfile, setOpenProfile] = useState(false);
  const { chatProfile } = useChat();

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
      alignItems={"center"}
    >
      <Stack
        direction={"row"}
        width={"auto"}
        alignItems={"center"}
        justifyContent={"space-between"}
        p={1}
      >
        <Box>
          <Button onClick={() => setOpenProfile(true)}>
            {chatProfile.id && (
              <Stack direction={"row"} spacing={2} alignItems={"center"}>
                {true ? (
                  <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar
                      src={`data:image/png;base64, ${chatProfile.avatar}`}
                    />
                  </StyledBadge>
                ) : (
                  <Avatar
                    src={
                      "https://cdn.i-scmp.com/sites/default/files/styles/wide_landscape/public/d8/images/canvas/2024/03/21/ffa5b5dc-3fbf-41db-8b5f-d33280f96dee_1d2a602f.jpg?itok=Fpbj3u6T&v=1711010288"
                    }
                  />
                )}

                <Stack direction={"column"}>
                  <Typography textAlign={"left"} variant="h4">
                    {chatProfile.name}
                  </Typography>
                  {chatProfile.isGroupChat && (
                    <Typography textAlign={"left"} variant="h6">
                      {chatProfile.memberCount} thành viên
                    </Typography>
                  )}
                </Stack>
              </Stack>
            )}
          </Button>
        </Box>
        <Box>
          <Stack direction={"row"}>
            <IconButton>
              <PersonAddAltIcon />
            </IconButton>
            <IconButton>
              <SearchIcon />
            </IconButton>
            <IconButton>
              <CallIcon />
            </IconButton>
            <IconButton>
              <VideoCallIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                props.setOpenChatInfo((prev) => !prev);
              }}
            >
              <InfoIcon />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
      <Profile
        open={openProfile}
        handleClose={setOpenProfile}
        fullname="Beckham"
        avatar=""
      />
    </Box>
  );
};

export default Header;

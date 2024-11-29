import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { FC, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useMutation } from "react-query";
import { groupAPI } from "src/api/group.api";
import { useGroupList } from "src/contexts/GroupContext";
import { enqueueSnackbar } from "notistack";

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 30,
  height: 30,
  border: `2px solid ${theme.palette.background.paper}`,
}));

interface GroupProps {
  id: string;
  name: string;
  avatar: string;
}

const Group: FC<GroupProps> = (props) => {
  // make ui more beatifull
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // ------------------------
  const groupListContext = useGroupList();

  const handleLeaveGroup = () => {
    leaveGroup.mutate(props.id);
    setAnchorEl(null);
  };

  const leaveGroup = useMutation(groupAPI.leaveGroup, {
    onSuccess: (response) => {
      enqueueSnackbar(`leave group Sucessfull`, { variant: "success" });
      getGroupList.mutate({ searchText: "" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    },
  });

  const getGroupList = useMutation(groupAPI.groupList, {
    onSuccess: (response) => {
      if (response.data.count > 0) {
        const responseGroupList = [];
        response.data.groups.forEach((e) => {
          responseGroupList.push({
            id: e.group.id,
            name: e.group.name,
            avatar: e.group.avatar,
          });
        });
        groupListContext.setGroupList(responseGroupList);
        groupListContext.setCount(response.data.count);
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    },
  });

  return (
    <Stack direction={"row"} alignItems={"center"}>
      <Button
        key={props.id}
        size="large"
        sx={{ justifyContent: "left", width: "100%" }}
      >
        {/* <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={<SmallAvatar alt="Remy Sharp" src={props.avatar[0]} />}
        >
          <Avatar alt="Travis Howard" src={props.avatar[1]} />
        </Badge> */}
        <Avatar alt="Travis Howard" src={props.avatar} />

        <Typography variant="h4" sx={{ marginLeft: 3 }}>
          {props.name}
        </Typography>
      </Button>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreHorizIcon />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem sx={{ padding: 0 }} onClick={handleLeaveGroup}>
          <Button size="small">Leave group</Button>
        </MenuItem>
      </Menu>
      <Divider />
    </Stack>
  );
};

export default Group;

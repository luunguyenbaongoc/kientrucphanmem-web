import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { FC, useState } from "react";
import Friend from "./Friend";

import PersonIcon from "@mui/icons-material/Person";
import { useFriendList } from "src/contexts/FriendContext";
import { useMutation } from "react-query";
import { friendAPI } from "src/api/friend.api";
import { SearchFriendDto } from "src/types/api/dto";
import { enqueueSnackbar } from "notistack";

interface FriendsProps {}
const Friends: FC<FriendsProps> = (props) => {
  const [input, setInput] = useState({ text: "" } as SearchFriendDto);
  const { friendList, setFriendList } = useFriendList();

  const handleChangeInput = (e) => {
    setInput((p) => ({ ...p, text: e.target.value }));
  };
  const handleSearchFriend = (e) => {
    e.preventDefault();
    searchFriend.mutate(input);
  };

  const searchFriend = useMutation(friendAPI.searchFriend, {
    onSuccess: (response) => {
      if (response.data.length > 0) {
        const searchFriendResults = [];
        response.data.map((e) => {
          searchFriendResults.push({
            id: e.to_user_profile.id,
            fullname: e.to_user_profile.profile[0].fullname,
            avatar: e.to_user_profile.profile[0].avatar,
          });
        });
        setFriendList(searchFriendResults);
      } else {
        enqueueSnackbar("Not found friends with that name", {
          variant: "info",
        });
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    },
  });

  return (
    <Stack>
      <Box sx={{ backgroundColor: "#fff", padding: 2 }}>
        <Stack direction={"row"}>
          <PersonIcon sx={{ marginRight: 2 }} />
          <Typography variant="h4">Friend list</Typography>
        </Stack>
      </Box>
      <Box sx={{ paddingLeft: 3, paddingRight: 3 }} overflow="scroll">
        <Box sx={{ padding: 3 }}>
          <Typography>{`Contact (${
            friendList[0].id === "" ? 0 : friendList.length
          })`}</Typography>
        </Box>
        <Stack spacing={1} sx={{ backgroundColor: "#fff" }}>
          <Stack component={"form"} direction={"row"} padding={1} spacing={2}>
            <TextField
              size="small"
              label="Search friend"
              value={input.text}
              onChange={handleChangeInput}
            />
            <Button
            type="submit"
              size="small"
              variant="contained"
              onClick={handleSearchFriend}
            >
              Search
            </Button>
          </Stack>
          {friendList[0].id !== "" && friendList.map((f) => <Friend {...f} />)}
        </Stack>
      </Box>
    </Stack>
  );
};
export default Friends;

import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useGroupMembers } from "src/contexts/GroupMemberContext";
import Member from "./Member";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { friendAPI, groupAPI } from "src/api";
import { useFriendList } from "src/contexts/FriendContext";
import { enqueueSnackbar } from "notistack";

interface GroupMembersProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  group_id: string;
}

const GroupMembers: FC<GroupMembersProps> = (props) => {
  const [selectedFriend, setSelectedFriend] = useState([]);
  const [selectedRemovingMember, setSelectedRemovingMember] = useState([]);
  // const { friendList } = useFriendList();
  const { members, setMembers } = useGroupMembers();
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: friendList,
    refetch: refetchGetFriendList,
  } = useQuery({
    queryKey: ["getFriends"],
    queryFn: () => friendAPI.friendList(),
    select: (rs) => {
      return rs.data;
    },
  });

  const {
    isLoading: loadingGetGroupMembers,
    data: groupMembers,
    refetch: refetchGetGroupMembers,
  } = useQuery({
    queryKey: ["getGroupMembers", props.group_id],
    queryFn: () => groupAPI.getGroupMembers(props.group_id),
    select: (rs) => {
      return rs.data;
    },
  });

  const addableMembers = useMemo(() => {
    if (friendList && groupMembers) {
      const addableMembers = friendList.filter(
        (o) =>
          groupMembers.users.findIndex(
            (u) => u.user_id === o.to_user_profile.id
          ) === -1
      );

      const friendsOption = addableMembers.map((option) => {
        const firstLetter =
          option.to_user_profile.profile[0].fullname !== ""
            ? option.to_user_profile.profile[0].fullname[0].toUpperCase()
            : "";
        return {
          firstLetter: /[0-9]/.test(firstLetter) ? "0-9" : firstLetter,
          ...option,
        };
      });

      return friendsOption;
    }
  }, [friendList, groupMembers]);

  const removableMembers = useMemo(() => {
    if (groupMembers) {
      const friendsOption = groupMembers.users.map((option) => {
        const firstLetter =
          option.user.profile[0].fullname !== ""
            ? option.user.profile[0].fullname[0].toUpperCase()
            : "";
        return {
          firstLetter: /[0-9]/.test(firstLetter) ? "0-9" : firstLetter,
          ...option,
        };
      });

      return friendsOption;
    }
  }, [groupMembers]);

  const membersOption = members.map((option) => {
    const firstLetter =
      option.fullname !== "" ? option.fullname[0].toUpperCase() : "";
    return {
      firstLetter: /[0-9]/.test(firstLetter) ? "0-9" : firstLetter,
      ...option,
    };
  });

  const handleAddMember = () => {
    const user_ids = [];
    selectedFriend.forEach((e) => {
      user_ids.push(e.to_user_profile.id);
    });
    addMember.mutate({
      group_id: props.group_id,
      user_ids: user_ids,
    });
  };

  const handleRemoveMember = () => {
    const user_ids = [];
    selectedRemovingMember.forEach((e) => {
      user_ids.push(e.user_id);
    });
    removeMember.mutate({
      group_id: props.group_id,
      user_ids: user_ids,
    });
  };

  const addMember = useMutation(groupAPI.addMembers, {
    onSuccess: (response) => {
      enqueueSnackbar("Thêm vào nhóm thành công", { variant: "success" });
      setSelectedFriend([]);
      refetchGetFriendList();
      refetchGetGroupMembers();
      queryClient.invalidateQueries(["GetChatBoxListByUser"]);
    },
    onError: (error: any) => {
      enqueueSnackbar(error, { variant: "error" });
    },
  });

  const removeMember = useMutation(groupAPI.removeMembers, {
    onSuccess: (response) => {
      enqueueSnackbar("Xoá thành viên thành công", { variant: "success" });
      setSelectedRemovingMember([]);
      // refetchGetFriendList();
      refetchGetGroupMembers();
      queryClient.invalidateQueries(["GetChatBoxListByUser"]);
    },
    onError: (error: any) => {
      enqueueSnackbar(error, { variant: "error" });
    },
  });

  const getGroupMembers = useMutation(groupAPI.getGroupMembers, {
    onSuccess: (response) => {
      if (response.status === 200) {
        const groupMembers = [];
        response.data.users.forEach((u) => {
          groupMembers.push({
            user_id: u.user.id,
            profile_id: u.user.profile[0].id,
            fullname: u.user.profile[0].fullname,
            avatar: u.user.profile[0].avatar,
            active: "inactive",
          });
        });
        setMembers(groupMembers);
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error, { variant: "error" });
    },
  });

  return (
    <Dialog open={props.open} onClose={props.setOpen} fullWidth maxWidth="xs">
      <DialogTitle>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography variant="h4">Thành viên nhóm</Typography>
          <IconButton onClick={() => props.setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />
      <DialogContent>
        <Button
          size="small"
          sx={{ width: "100%", marginBottom: 1 }}
          variant="contained"
          onClick={handleAddMember}
        >
          Thêm thành viên
        </Button>
        <Autocomplete
          multiple
          value={selectedFriend}
          id="group-members"
          disableCloseOnSelect
          options={
            addableMembers &&
            addableMembers.sort(
              (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
            )
          }
          groupBy={(option) => option.firstLetter}
          getOptionLabel={(option) =>
            option.to_user_profile.profile[0].fullname
          }
          filterSelectedOptions
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tìm kiếm bạn bè"
              placeholder="Thêm thành viên"
            />
          )}
          onChange={(event, value) => setSelectedFriend(value)}
        ></Autocomplete>
        <Button
          size="small"
          color="error"
          sx={{ width: "100%", marginBottom: 1, marginTop: 1 }}
          variant="contained"
          onClick={handleRemoveMember}
        >
          Xóa thành viên
        </Button>
        <Autocomplete
          value={selectedRemovingMember}
          multiple
          id="group-members"
          disableCloseOnSelect
          options={
            removableMembers &&
            removableMembers.sort(
              (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
            )
          }
          groupBy={(option: any) => option.firstLetter}
          getOptionLabel={(option: any) => option.user.profile[0].fullname}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField
              {...params}
              label="Chọn thành viên"
              placeholder="Chọn thành viên"
            />
          )}
          onChange={(event, value) => setSelectedRemovingMember(value)}
        ></Autocomplete>
        {!loadingGetGroupMembers && (
          <>
            <Typography
              variant="h5"
              padding={2}
            >{`Danh sách thành viên (${groupMembers.count})`}</Typography>
            <Stack spacing={2}>
              {groupMembers.users.map((m) => {
                const { fullname, avatar } = m.user.profile[0];
                return (
                  <Member
                    key={m.user_id}
                    id={m.user_id}
                    fullname={fullname}
                    avatar={avatar}
                  />
                );
              })}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembers;

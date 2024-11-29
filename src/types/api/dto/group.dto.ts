export class CreateGroupDto {
  name: string;
  description: string;
  user_ids: string[];
}

export class GroupListDto {
  searchText: string;
}

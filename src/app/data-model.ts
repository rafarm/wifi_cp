export class Group {
  cn = '';
  displayName = '';
}

export class User {
  uid = '';
  displayName = '';
}

export class Grouping {
  _id = '';
  owner_id = '';
  name = '';
  description = '';
  members: User[] = [];
}

export class Schedule {
  _id = '';
  owner_id = '';
  grouping_id = '';
  grouping_name = '';
  start: Date = null;
  end: Date = null;
}

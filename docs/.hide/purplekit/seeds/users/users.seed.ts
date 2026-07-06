import { IUser } from 'docs/src/types/user';
import { common } from '../helpers/common';
import { IDs } from '../helpers/ids';

export const userSeeds: IUser[] = [
  {
    ...common(IDs.USERS.USER_1, 1),
    email: 'john@example.com',
    fname: 'John',
    lname: 'Doe',
  },
  {
    ...common(IDs.USERS.USER_2, 2),
    email: 'mary@example.com',
    fname: 'Mary',
    lname: 'Hunter',
  },
  {
    ...common(IDs.USERS.USER_3, 3),
    email: 'adam@example.com',
    fname: 'Adam',
    lname: 'Mohammed',
  },
];

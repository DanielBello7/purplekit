import { ICommon } from './base';

export type IUser = ICommon & {
  email: string;
  fname: string;
  lname: string;
};

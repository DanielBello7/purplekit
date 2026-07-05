import { UUID, ICommon } from './base';

export type IPost = ICommon & {
  body: string;
  title: string;
  createdBy: UUID;
};

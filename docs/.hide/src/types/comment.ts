import { UUID, ICommon } from './base';

export type IComment = ICommon & {
  text: string;
  createdBy: UUID;
};

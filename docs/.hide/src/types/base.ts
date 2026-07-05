export type UUID = string;

export type ICommon = {
  id: UUID;
  index: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | undefined;
};

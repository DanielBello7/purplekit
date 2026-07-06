import { UUID, ICommon } from 'docs/src/types/base';

const now = new Date();

export function common(id: UUID, index: number): ICommon {
  return {
    id,
    index,
    createdAt: now,
    updatedAt: now,
    deletedAt: undefined,
  };
}

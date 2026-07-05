import { IComment } from 'docs/src/types/comment';
import { common } from '../helpers/common';
import { IDs } from '../helpers/ids';

export const commentSeeds: IComment[] = [
  {
    ...common(IDs.COMMENTS.POST_1_COMMENT_1, 1),
    createdBy: IDs.USERS.USER_2,
    text: 'The point about naming assumptions is excellent. It makes planning feel less like fortune telling and more like a shared decision record.',
  },
  {
    ...common(IDs.COMMENTS.POST_1_COMMENT_2, 2),
    createdBy: IDs.USERS.USER_3,
    text: 'I like the two-week review rhythm. It is short enough to catch bad bets early without turning planning into a daily ceremony.',
  },
  {
    ...common(IDs.COMMENTS.POST_2_COMMENT_1, 3),
    createdBy: IDs.USERS.USER_2,
    text: 'Removing decisions from onboarding is underrated. People usually want momentum first, then control once they trust the product.',
  },
  {
    ...common(IDs.COMMENTS.POST_2_COMMENT_2, 4),
    createdBy: IDs.USERS.USER_3,
    text: 'Clear empty states helped us too. A good empty state can do more teaching than another settings page.',
  },
  {
    ...common(IDs.COMMENTS.POST_3_COMMENT_1, 5),
    createdBy: IDs.USERS.USER_1,
    text: 'Decision-based notes are much easier to maintain. They preserve the reasoning, not just the outcome, which is what future readers actually need.',
  },
];

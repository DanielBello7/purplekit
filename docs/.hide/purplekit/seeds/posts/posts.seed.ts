import { IPost } from 'docs/src/types/post';
import { common } from '../helpers/common';
import { IDs } from '../helpers/ids';

export const postSeeds: IPost[] = [
  {
    ...common(IDs.POSTS.USER_1_POST_1, 1),
    title: 'Designing a calmer product roadmap',
    createdBy: IDs.USERS.USER_1,
    body: `A roadmap is most useful when it explains tradeoffs instead of pretending the future is perfectly known. Our team started treating roadmap planning as a living conversation between customer pain, engineering capacity, and market timing. That shift changed the tone immediately. Instead of arguing about dates too early, we began writing clearer problem statements, naming the assumptions behind each bet, and reviewing progress every two weeks. The result was not a slower process. It was a calmer one. People knew why work mattered, what could move, and which decisions needed fresh evidence before we committed more time.`,
  },
  {
    ...common(IDs.POSTS.USER_1_POST_2, 2),
    title: 'What we learned from rebuilding our onboarding flow',
    createdBy: IDs.USERS.USER_1,
    body: `When we rebuilt onboarding, the biggest improvement did not come from adding more screens. It came from removing the parts that asked new users to make decisions before they understood the product. We replaced long setup forms with small prompts tied to visible progress, moved optional configuration behind sensible defaults, and added clearer empty states where people usually got stuck. Support tickets dropped because users no longer had to guess what a workspace, project, or invite meant. The lesson was simple but easy to forget: onboarding should help people reach one meaningful success, not prove they understand every feature.`,
  },
  {
    ...common(IDs.POSTS.USER_2_POST_1, 3),
    title: 'Keeping engineering notes useful after launch',
    createdBy: IDs.USERS.USER_2,
    body: `Engineering notes often start strong and fade into archaeology after a launch. We changed that by writing notes around decisions instead of tasks. Each note captures the context, the options considered, the chosen path, and the conditions that would make us revisit it. That structure has helped new teammates understand old choices without needing three meetings and a heroic memory from someone who was there. It also makes refactoring less emotional. When the original constraints are visible, changing direction feels like maintenance of the truth rather than criticism of the past.`,
  },
];

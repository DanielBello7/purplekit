import pc from 'picocolors';

/** Logs a cyan info message to stdout. */
export const print = (...args: string[]) => {
  return console.log(pc.cyanBright(args.join(' ')));
};

/** Logs a red error message to stdout. */
export const printf = (...args: string[]) => {
  return console.log(pc.redBright(args.join(' ')));
};

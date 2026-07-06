"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printf = exports.print = void 0;
const picocolors_1 = __importDefault(require("picocolors"));
/** Logs a cyan info message to stdout. */
const print = (...args) => {
    return console.log(picocolors_1.default.cyanBright(args.join(' ')));
};
exports.print = print;
/** Logs a red error message to stdout. */
const printf = (...args) => {
    return console.log(picocolors_1.default.redBright(args.join(' ')));
};
exports.printf = printf;
//# sourceMappingURL=print.js.map
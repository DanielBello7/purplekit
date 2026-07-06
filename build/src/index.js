"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = exports.seed = exports.migration = exports.migrate = exports.init = exports.gen = exports.dropdb = exports.createdb = exports.seedEntities = void 0;
var seed_entities_1 = require("./libs/seed-entities");
Object.defineProperty(exports, "seedEntities", { enumerable: true, get: function () { return seed_entities_1.seedEntities; } });
var features_1 = require("./features");
Object.defineProperty(exports, "createdb", { enumerable: true, get: function () { return features_1.createdb; } });
Object.defineProperty(exports, "dropdb", { enumerable: true, get: function () { return features_1.dropdb; } });
Object.defineProperty(exports, "gen", { enumerable: true, get: function () { return features_1.gen; } });
Object.defineProperty(exports, "init", { enumerable: true, get: function () { return features_1.init; } });
Object.defineProperty(exports, "migrate", { enumerable: true, get: function () { return features_1.migrate; } });
Object.defineProperty(exports, "migration", { enumerable: true, get: function () { return features_1.migration; } });
Object.defineProperty(exports, "seed", { enumerable: true, get: function () { return features_1.seed; } });
Object.defineProperty(exports, "status", { enumerable: true, get: function () { return features_1.status; } });
//# sourceMappingURL=index.js.map
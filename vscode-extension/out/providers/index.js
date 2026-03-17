"use strict";
// Exportar todos os providers da extensao
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeActionsProvider = exports.ToolsProvider = exports.ExercisesProvider = void 0;
var exercisesProvider_1 = require("./exercisesProvider");
Object.defineProperty(exports, "ExercisesProvider", { enumerable: true, get: function () { return exercisesProvider_1.ExercisesProvider; } });
var toolsProvider_1 = require("./toolsProvider");
Object.defineProperty(exports, "ToolsProvider", { enumerable: true, get: function () { return toolsProvider_1.ToolsProvider; } });
var codeActionsProvider_1 = require("./codeActionsProvider");
Object.defineProperty(exports, "CodeActionsProvider", { enumerable: true, get: function () { return codeActionsProvider_1.CodeActionsProvider; } });
//# sourceMappingURL=index.js.map
"use strict";
// Exportar todos os serviços da extensao
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsService = exports.getPlatformService = exports.PlatformService = exports.CompilerService = exports.CopilotService = exports.MoulinetteService = exports.NorminetteService = void 0;
var norminetteService_1 = require("./norminetteService");
Object.defineProperty(exports, "NorminetteService", { enumerable: true, get: function () { return norminetteService_1.NorminetteService; } });
var moulinetteService_1 = require("./moulinetteService");
Object.defineProperty(exports, "MoulinetteService", { enumerable: true, get: function () { return moulinetteService_1.MoulinetteService; } });
var copilotService_1 = require("./copilotService");
Object.defineProperty(exports, "CopilotService", { enumerable: true, get: function () { return copilotService_1.CopilotService; } });
var compilerService_1 = require("./compilerService");
Object.defineProperty(exports, "CompilerService", { enumerable: true, get: function () { return compilerService_1.CompilerService; } });
var platformService_1 = require("./platformService");
Object.defineProperty(exports, "PlatformService", { enumerable: true, get: function () { return platformService_1.PlatformService; } });
Object.defineProperty(exports, "getPlatformService", { enumerable: true, get: function () { return platformService_1.getPlatformService; } });
var diagnosticsService_1 = require("./diagnosticsService");
Object.defineProperty(exports, "DiagnosticsService", { enumerable: true, get: function () { return diagnosticsService_1.DiagnosticsService; } });
//# sourceMappingURL=index.js.map
"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/stripe/route";
exports.ids = ["app/api/stripe/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Froute&page=%2Fapi%2Fstripe%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Froute.js&appDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Froute&page=%2Fapi%2Fstripe%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Froute.js&appDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_flpch_Repos_video_reels_generator_src_app_api_stripe_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/stripe/route.js */ \"(rsc)/./src/app/api/stripe/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/stripe/route\",\n        pathname: \"/api/stripe\",\n        filename: \"route\",\n        bundlePath: \"app/api/stripe/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\flpch\\\\Repos\\\\video-reels-generator\\\\src\\\\app\\\\api\\\\stripe\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_flpch_Repos_video_reels_generator_src_app_api_stripe_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/stripe/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzdHJpcGUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnN0cmlwZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnN0cmlwZSUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNmbHBjaCU1Q1JlcG9zJTVDdmlkZW8tcmVlbHMtZ2VuZXJhdG9yJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNmbHBjaCU1Q1JlcG9zJTVDdmlkZW8tcmVlbHMtZ2VuZXJhdG9yJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PXN0YW5kYWxvbmUmcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUMrQjtBQUM1RztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzZKOztBQUU3SiIsInNvdXJjZXMiOlsid2VicGFjazovL3ZpZGVvLWVkaXRvci1hcHAvPzczMDgiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcZmxwY2hcXFxcUmVwb3NcXFxcdmlkZW8tcmVlbHMtZ2VuZXJhdG9yXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXHN0cmlwZVxcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJzdGFuZGFsb25lXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3N0cmlwZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3N0cmlwZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc3RyaXBlL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcZmxwY2hcXFxcUmVwb3NcXFxcdmlkZW8tcmVlbHMtZ2VuZXJhdG9yXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXHN0cmlwZVxcXFxyb3V0ZS5qc1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9zdHJpcGUvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Froute&page=%2Fapi%2Fstripe%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Froute.js&appDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/stripe/route.js":
/*!*************************************!*\
  !*** ./src/app/api/stripe/route.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   OPTIONS: () => (/* binding */ OPTIONS),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n\n\nif (!process.env.STRIPE_SECRET_KEY) {\n    throw new Error(\"STRIPE_SECRET_KEY n\\xe3o est\\xe1 definida\");\n}\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_1__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: \"2023-10-16\"\n});\nasync function POST(request) {\n    console.log(\"Recebendo requisi\\xe7\\xe3o POST para criar sess\\xe3o do Stripe\");\n    try {\n        const { email } = await request.json();\n        console.log(\"Email recebido:\", email);\n        // Criar sessão de checkout\n        console.log(\"Criando sess\\xe3o do Stripe...\");\n        const session = await stripe.checkout.sessions.create({\n            payment_method_types: [\n                \"card\"\n            ],\n            line_items: [\n                {\n                    price_data: {\n                        currency: \"brl\",\n                        product_data: {\n                            name: \"Video Reels Generator - Licen\\xe7a\",\n                            description: \"Licen\\xe7a vital\\xedcia para o Video Reels Generator\"\n                        },\n                        unit_amount: 9900\n                    },\n                    quantity: 1\n                }\n            ],\n            mode: \"payment\",\n            success_url: `${\"http://localhost:3000\"}/success?session_id={CHECKOUT_SESSION_ID}`,\n            cancel_url: `${\"http://localhost:3000\"}/cancel`,\n            customer_email: email,\n            metadata: {\n                email: email\n            }\n        });\n        console.log(\"Sess\\xe3o criada com sucesso:\", session.id);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            url: session.url\n        });\n    } catch (error) {\n        console.error(\"Erro detalhado ao criar sess\\xe3o:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: error.message\n        }, {\n            status: 500\n        });\n    }\n}\n// Permitir CORS\nasync function OPTIONS(request) {\n    return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({}, {\n        headers: {\n            \"Access-Control-Allow-Origin\": \"*\",\n            \"Access-Control-Allow-Methods\": \"POST, OPTIONS\",\n            \"Access-Control-Allow-Headers\": \"Content-Type\"\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9zdHJpcGUvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUEyQztBQUNmO0FBRTVCLElBQUksQ0FBQ0UsUUFBUUMsR0FBRyxDQUFDQyxpQkFBaUIsRUFBRTtJQUNoQyxNQUFNLElBQUlDLE1BQU07QUFDcEI7QUFFQSxNQUFNQyxTQUFTLElBQUlMLDhDQUFNQSxDQUFDQyxRQUFRQyxHQUFHLENBQUNDLGlCQUFpQixFQUFFO0lBQ3JERyxZQUFZO0FBQ2hCO0FBRU8sZUFBZUMsS0FBS0MsT0FBTztJQUM5QkMsUUFBUUMsR0FBRyxDQUFDO0lBRVosSUFBSTtRQUNBLE1BQU0sRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTUgsUUFBUUksSUFBSTtRQUNwQ0gsUUFBUUMsR0FBRyxDQUFDLG1CQUFtQkM7UUFFL0IsMkJBQTJCO1FBQzNCRixRQUFRQyxHQUFHLENBQUM7UUFDWixNQUFNRyxVQUFVLE1BQU1SLE9BQU9TLFFBQVEsQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLENBQUM7WUFDbERDLHNCQUFzQjtnQkFBQzthQUFPO1lBQzlCQyxZQUFZO2dCQUNSO29CQUNJQyxZQUFZO3dCQUNSQyxVQUFVO3dCQUNWQyxjQUFjOzRCQUNWQyxNQUFNOzRCQUNOQyxhQUFhO3dCQUNqQjt3QkFDQUMsYUFBYTtvQkFDakI7b0JBQ0FDLFVBQVU7Z0JBQ2Q7YUFDSDtZQUNEQyxNQUFNO1lBQ05DLGFBQWEsQ0FBQyxFQUFFMUIsdUJBQTJCLENBQUMseUNBQXlDLENBQUM7WUFDdEY0QixZQUFZLENBQUMsRUFBRTVCLHVCQUEyQixDQUFDLE9BQU8sQ0FBQztZQUNuRDZCLGdCQUFnQm5CO1lBQ2hCb0IsVUFBVTtnQkFDTnBCLE9BQU9BO1lBQ1g7UUFDSjtRQUVBRixRQUFRQyxHQUFHLENBQUMsaUNBQThCRyxRQUFRbUIsRUFBRTtRQUNwRCxPQUFPakMsa0ZBQVlBLENBQUNhLElBQUksQ0FBQztZQUFFcUIsS0FBS3BCLFFBQVFvQixHQUFHO1FBQUM7SUFFaEQsRUFBRSxPQUFPQyxPQUFPO1FBQ1p6QixRQUFReUIsS0FBSyxDQUFDLHNDQUFtQ0E7UUFDakQsT0FBT25DLGtGQUFZQSxDQUFDYSxJQUFJLENBQ3BCO1lBQUVzQixPQUFPQSxNQUFNQyxPQUFPO1FBQUMsR0FDdkI7WUFBRUMsUUFBUTtRQUFJO0lBRXRCO0FBQ0o7QUFFQSxnQkFBZ0I7QUFDVCxlQUFlQyxRQUFRN0IsT0FBTztJQUNqQyxPQUFPVCxrRkFBWUEsQ0FBQ2EsSUFBSSxDQUFDLENBQUMsR0FBRztRQUN6QjBCLFNBQVM7WUFDTCwrQkFBK0I7WUFDL0IsZ0NBQWdDO1lBQ2hDLGdDQUFnQztRQUNwQztJQUNKO0FBQ0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92aWRlby1lZGl0b3ItYXBwLy4vc3JjL2FwcC9hcGkvc3RyaXBlL3JvdXRlLmpzP2FiNmEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IFN0cmlwZSBmcm9tICdzdHJpcGUnO1xuXG5pZiAoIXByb2Nlc3MuZW52LlNUUklQRV9TRUNSRVRfS0VZKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTVFJJUEVfU0VDUkVUX0tFWSBuw6NvIGVzdMOhIGRlZmluaWRhJyk7XG59XG5cbmNvbnN0IHN0cmlwZSA9IG5ldyBTdHJpcGUocHJvY2Vzcy5lbnYuU1RSSVBFX1NFQ1JFVF9LRVksIHtcbiAgICBhcGlWZXJzaW9uOiAnMjAyMy0xMC0xNidcbn0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0KSB7XG4gICAgY29uc29sZS5sb2coJ1JlY2ViZW5kbyByZXF1aXNpw6fDo28gUE9TVCBwYXJhIGNyaWFyIHNlc3PDo28gZG8gU3RyaXBlJyk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBlbWFpbCB9ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFbWFpbCByZWNlYmlkbzonLCBlbWFpbCk7XG5cbiAgICAgICAgLy8gQ3JpYXIgc2Vzc8OjbyBkZSBjaGVja291dFxuICAgICAgICBjb25zb2xlLmxvZygnQ3JpYW5kbyBzZXNzw6NvIGRvIFN0cmlwZS4uLicpO1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgc3RyaXBlLmNoZWNrb3V0LnNlc3Npb25zLmNyZWF0ZSh7XG4gICAgICAgICAgICBwYXltZW50X21ldGhvZF90eXBlczogWydjYXJkJ10sXG4gICAgICAgICAgICBsaW5lX2l0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcmljZV9kYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeTogJ2JybCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9kdWN0X2RhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnVmlkZW8gUmVlbHMgR2VuZXJhdG9yIC0gTGljZW7Dp2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTGljZW7Dp2Egdml0YWzDrWNpYSBwYXJhIG8gVmlkZW8gUmVlbHMgR2VuZXJhdG9yJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXRfYW1vdW50OiA5OTAwLCAvLyBSJCA5OSwwMFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eTogMSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG1vZGU6ICdwYXltZW50JyxcbiAgICAgICAgICAgIHN1Y2Nlc3NfdXJsOiBgJHtwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19VUkx9L3N1Y2Nlc3M/c2Vzc2lvbl9pZD17Q0hFQ0tPVVRfU0VTU0lPTl9JRH1gLFxuICAgICAgICAgICAgY2FuY2VsX3VybDogYCR7cHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfVVJMfS9jYW5jZWxgLFxuICAgICAgICAgICAgY3VzdG9tZXJfZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogZW1haWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1Nlc3PDo28gY3JpYWRhIGNvbSBzdWNlc3NvOicsIHNlc3Npb24uaWQpO1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB1cmw6IHNlc3Npb24udXJsIH0pO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJybyBkZXRhbGhhZG8gYW8gY3JpYXIgc2Vzc8OjbzonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgICAgIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSxcbiAgICAgICAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICAgICApO1xuICAgIH1cbn1cblxuLy8gUGVybWl0aXIgQ09SU1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIE9QVElPTlMocmVxdWVzdCkge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7fSwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCwgT1BUSU9OUycsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnXG4gICAgICAgIH0sXG4gICAgfSk7XG59ICJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJTdHJpcGUiLCJwcm9jZXNzIiwiZW52IiwiU1RSSVBFX1NFQ1JFVF9LRVkiLCJFcnJvciIsInN0cmlwZSIsImFwaVZlcnNpb24iLCJQT1NUIiwicmVxdWVzdCIsImNvbnNvbGUiLCJsb2ciLCJlbWFpbCIsImpzb24iLCJzZXNzaW9uIiwiY2hlY2tvdXQiLCJzZXNzaW9ucyIsImNyZWF0ZSIsInBheW1lbnRfbWV0aG9kX3R5cGVzIiwibGluZV9pdGVtcyIsInByaWNlX2RhdGEiLCJjdXJyZW5jeSIsInByb2R1Y3RfZGF0YSIsIm5hbWUiLCJkZXNjcmlwdGlvbiIsInVuaXRfYW1vdW50IiwicXVhbnRpdHkiLCJtb2RlIiwic3VjY2Vzc191cmwiLCJORVhUX1BVQkxJQ19VUkwiLCJjYW5jZWxfdXJsIiwiY3VzdG9tZXJfZW1haWwiLCJtZXRhZGF0YSIsImlkIiwidXJsIiwiZXJyb3IiLCJtZXNzYWdlIiwic3RhdHVzIiwiT1BUSU9OUyIsImhlYWRlcnMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/stripe/route.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/stripe","vendor-chunks/qs","vendor-chunks/object-inspect","vendor-chunks/get-intrinsic","vendor-chunks/side-channel","vendor-chunks/define-data-property","vendor-chunks/has-symbols","vendor-chunks/function-bind","vendor-chunks/call-bind","vendor-chunks/set-function-length","vendor-chunks/has-property-descriptors","vendor-chunks/es-errors","vendor-chunks/es-define-property","vendor-chunks/has-proto","vendor-chunks/gopd","vendor-chunks/hasown"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Froute&page=%2Fapi%2Fstripe%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Froute.js&appDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cflpch%5CRepos%5Cvideo-reels-generator&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
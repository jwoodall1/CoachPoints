(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/@vercel/analytics/dist/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeRoute",
    ()=>computeRoute,
    "default",
    ()=>generic_default,
    "inject",
    ()=>inject,
    "pageview",
    ()=>pageview,
    "track",
    ()=>track
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/statcard/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// src/queue.ts
var initQueue = ()=>{
    if (window.va) return;
    window.va = function a(...params) {
        if (!window.vaq) window.vaq = [];
        window.vaq.push(params);
    };
};
// package.json
var name = "@vercel/analytics";
var version = "2.0.1";
// src/utils.ts
function isBrowser() {
    return typeof window !== "undefined";
}
function detectEnvironment() {
    try {
        const env = ("TURBOPACK compile-time value", "development");
        if ("TURBOPACK compile-time truthy", 1) {
            return "development";
        }
    } catch  {}
    return "production";
}
function setMode(mode = "auto") {
    if (mode === "auto") {
        window.vam = detectEnvironment();
        return;
    }
    window.vam = mode;
}
function getMode() {
    const mode = isBrowser() ? window.vam : detectEnvironment();
    return mode || "production";
}
function isProduction() {
    return getMode() === "production";
}
function isDevelopment() {
    return getMode() === "development";
}
function removeKey(key, { [key]: _, ...rest }) {
    return rest;
}
function parseProperties(properties, options) {
    if (!properties) return void 0;
    let props = properties;
    const errorProperties = [];
    for (const [key, value] of Object.entries(properties)){
        if (typeof value === "object" && value !== null) {
            if (options.strip) {
                props = removeKey(key, props);
            } else {
                errorProperties.push(key);
            }
        }
    }
    if (errorProperties.length > 0 && !options.strip) {
        throw Error(`The following properties are not valid: ${errorProperties.join(", ")}. Only strings, numbers, booleans, and null are allowed.`);
    }
    return props;
}
function computeRoute(pathname, pathParams) {
    if (!pathname || !pathParams) {
        return pathname;
    }
    let result = pathname;
    try {
        const entries = Object.entries(pathParams);
        for (const [key, value] of entries){
            if (!Array.isArray(value)) {
                const matcher = turnValueToRegExp(value);
                if (matcher.test(result)) {
                    result = result.replace(matcher, `/[${key}]`);
                }
            }
        }
        for (const [key, value] of entries){
            if (Array.isArray(value)) {
                const matcher = turnValueToRegExp(value.join("/"));
                if (matcher.test(result)) {
                    result = result.replace(matcher, `/[...${key}]`);
                }
            }
        }
        return result;
    } catch  {
        return pathname;
    }
}
function turnValueToRegExp(value) {
    return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getScriptSrc(props) {
    if (props.scriptSrc) {
        return makeAbsolute(props.scriptSrc);
    }
    if (isDevelopment()) {
        return "https://va.vercel-scripts.com/v1/script.debug.js";
    }
    if (props.basePath) {
        return makeAbsolute(`${props.basePath}/insights/script.js`);
    }
    return "/_vercel/insights/script.js";
}
function loadProps(explicitProps, confString) {
    var _a;
    let props = explicitProps;
    if (confString) {
        try {
            props = {
                ...(_a = JSON.parse(confString)) == null ? void 0 : _a.analytics,
                ...explicitProps
            };
        } catch  {}
    }
    setMode(props.mode);
    const dataset = {
        sdkn: name + (props.framework ? `/${props.framework}` : ""),
        sdkv: version
    };
    if (props.disableAutoTrack) {
        dataset.disableAutoTrack = "1";
    }
    if (props.viewEndpoint) {
        dataset.viewEndpoint = makeAbsolute(props.viewEndpoint);
    }
    if (props.eventEndpoint) {
        dataset.eventEndpoint = makeAbsolute(props.eventEndpoint);
    }
    if (props.sessionEndpoint) {
        dataset.sessionEndpoint = makeAbsolute(props.sessionEndpoint);
    }
    if (isDevelopment() && props.debug === false) {
        dataset.debug = "false";
    }
    if (props.dsn) {
        dataset.dsn = props.dsn;
    }
    if (props.endpoint) {
        dataset.endpoint = props.endpoint;
    } else if (props.basePath) {
        dataset.endpoint = makeAbsolute(`${props.basePath}/insights`);
    }
    return {
        beforeSend: props.beforeSend,
        src: getScriptSrc(props),
        dataset
    };
}
function makeAbsolute(url) {
    return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") ? url : `/${url}`;
}
// src/generic.ts
function inject(props = {
    debug: true
}, confString) {
    var _a;
    if (!isBrowser()) return;
    const { beforeSend, src, dataset } = loadProps(props, confString);
    initQueue();
    if (beforeSend) {
        (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", beforeSend);
    }
    if (document.head.querySelector(`script[src*="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    for (const [key, value] of Object.entries(dataset)){
        script.dataset[key] = value;
    }
    script.defer = true;
    script.onerror = ()=>{
        const errorMessage = isDevelopment() ? "Please check if any ad blockers are enabled and try again." : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";
        console.log(`[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`);
    };
    document.head.appendChild(script);
}
function track(name2, properties, options) {
    var _a, _b;
    if (!isBrowser()) {
        const msg = "[Vercel Web Analytics] Please import `track` from `@vercel/analytics/server` when using this function in a server environment";
        if (isProduction()) {
            console.warn(msg);
        } else {
            throw new Error(msg);
        }
        return;
    }
    if (!properties) {
        (_a = window.va) == null ? void 0 : _a.call(window, "event", {
            name: name2,
            options
        });
        return;
    }
    try {
        const props = parseProperties(properties, {
            strip: isProduction()
        });
        (_b = window.va) == null ? void 0 : _b.call(window, "event", {
            name: name2,
            data: props,
            options
        });
    } catch (err) {
        if (err instanceof Error && isDevelopment()) {
            console.error(err);
        }
    }
}
function pageview({ route, path }) {
    var _a;
    (_a = window.va) == null ? void 0 : _a.call(window, "pageview", {
        route,
        path
    });
}
var generic_default = {
    inject,
    track,
    computeRoute
};
;
}),
"[project]/statcard/node_modules/lucide-react/dist/esm/icons/list-plus.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ListPlus
]);
/**
 * @license lucide-react v1.34.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 5H3",
            key: "m91uny"
        }
    ],
    [
        "path",
        {
            d: "M11 12H3",
            key: "51ecnj"
        }
    ],
    [
        "path",
        {
            d: "M16 19H3",
            key: "zzsher"
        }
    ],
    [
        "path",
        {
            d: "M18 9v6",
            key: "1twb98"
        }
    ],
    [
        "path",
        {
            d: "M21 12h-6",
            key: "bt1uis"
        }
    ]
];
const ListPlus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("list-plus", __iconNode);
;
}),
"[project]/statcard/node_modules/lucide-react/dist/esm/icons/list-plus.mjs [app-client] (ecmascript) <export default as ListPlus>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ListPlus",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/list-plus.mjs [app-client] (ecmascript)");
}),
"[project]/statcard/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Plus
]);
/**
 * @license lucide-react v1.34.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M5 12h14",
            key: "1ays0h"
        }
    ],
    [
        "path",
        {
            d: "M12 5v14",
            key: "s699le"
        }
    ]
];
const Plus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("plus", __iconNode);
;
}),
"[project]/statcard/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Plus",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript)");
}),
"[project]/statcard/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>X
]);
/**
 * @license lucide-react v1.34.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M18 6 6 18",
            key: "1bl5f8"
        }
    ],
    [
        "path",
        {
            d: "m6 6 12 12",
            key: "d8bk6v"
        }
    ]
];
const X = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("x", __iconNode);
;
}),
"[project]/statcard/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "X",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript)");
}),
"[project]/statcard/src/components/AddToListButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AddToListButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListPlus$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/list-plus.mjs [app-client] (ecmascript) <export default as ListPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/components/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/lib/analytics.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
let closeActivePicker = null;
function AddToListButton({ athleteId, prominent = false }) {
    _s();
    const { ready, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lists, setLists] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [memberListIds, setMemberListIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [newListName, setNewListName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [popoverPosition, setPopoverPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    const pickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const popoverRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const closePicker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AddToListButton.useCallback[closePicker]": ()=>setOpen(false)
    }["AddToListButton.useCallback[closePicker]"], []);
    const isCoach = user?.user_metadata.account_type === 'coach';
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddToListButton.useEffect": ()=>{
            if (!open) return;
            // Only the open picker needs a document-level listener.
            const handleOutsideClick = {
                "AddToListButton.useEffect.handleOutsideClick": (event)=>{
                    const target = event.target;
                    if (pickerRef.current && !pickerRef.current.contains(target) && !popoverRef.current?.contains(target)) {
                        closePicker();
                        if (closeActivePicker === closePicker) closeActivePicker = null;
                    }
                }
            }["AddToListButton.useEffect.handleOutsideClick"];
            document.addEventListener('pointerdown', handleOutsideClick);
            return ({
                "AddToListButton.useEffect": ()=>document.removeEventListener('pointerdown', handleOutsideClick)
            })["AddToListButton.useEffect"];
        }
    }["AddToListButton.useEffect"], [
        closePicker,
        open
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddToListButton.useEffect": ()=>{
            if (!open) return;
            const positionPopover = {
                "AddToListButton.useEffect.positionPopover": ()=>{
                    const anchor = pickerRef.current;
                    const popover = popoverRef.current;
                    if (!anchor || !popover) return;
                    const anchorRect = anchor.getBoundingClientRect();
                    const popoverWidth = Math.min(288, window.innerWidth - 32);
                    const gap = 8;
                    const edge = 16;
                    const left = Math.min(Math.max(edge, anchorRect.right - popoverWidth), window.innerWidth - popoverWidth - edge);
                    const below = anchorRect.bottom + gap;
                    const above = anchorRect.top - popover.offsetHeight - gap;
                    const top = below + popover.offsetHeight <= window.innerHeight - edge || above < edge ? below : above;
                    setPopoverPosition({
                        top: Math.max(edge, top),
                        left
                    });
                }
            }["AddToListButton.useEffect.positionPopover"];
            positionPopover();
            window.addEventListener('resize', positionPopover);
            window.addEventListener('scroll', positionPopover, true);
            return ({
                "AddToListButton.useEffect": ()=>{
                    window.removeEventListener('resize', positionPopover);
                    window.removeEventListener('scroll', positionPopover, true);
                }
            })["AddToListButton.useEffect"];
        }
    }["AddToListButton.useEffect"], [
        error,
        lists,
        loading,
        open
    ]);
    const loadLists = async ()=>{
        setLoading(true);
        setError(null);
        const [{ data: listsData, error: listsError }, { data: memberData, error: memberError }] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('coach_lists').select('id, name').order('created_at', {
                ascending: true
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('coach_list_members').select('list_id').eq('athlete_id', athleteId)
        ]);
        if (listsError || memberError) setError('Unable to load your lists.');
        else {
            setLists(listsData ?? []);
            setMemberListIds((memberData ?? []).map((entry)=>entry.list_id));
        }
        setLoading(false);
    };
    const openPicker = async ()=>{
        if (open) {
            setOpen(false);
            if (closeActivePicker === closePicker) closeActivePicker = null;
            return;
        }
        closeActivePicker?.();
        closeActivePicker = closePicker;
        setError(null);
        setOpen(true);
        await loadLists();
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddToListButton.useEffect": ()=>({
                "AddToListButton.useEffect": ()=>{
                    if (closeActivePicker === closePicker) closeActivePicker = null;
                }
            })["AddToListButton.useEffect"]
    }["AddToListButton.useEffect"], [
        closePicker
    ]);
    const toggleMembership = async (list)=>{
        const isMember = memberListIds.includes(list.id);
        setSaving(list.id);
        setError(null);
        const result = isMember ? await __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('coach_list_members').delete().eq('list_id', list.id).eq('athlete_id', athleteId) : await __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('coach_list_members').insert({
            list_id: list.id,
            athlete_id: athleteId
        });
        if (result.error) setError(result.error.message);
        else {
            setMemberListIds((current)=>isMember ? current.filter((id)=>id !== list.id) : [
                    ...current,
                    list.id
                ]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])('recruiting_list_action', {
                action: isMember ? 'athlete_removed' : 'athlete_added'
            });
        }
        setSaving(null);
    };
    const createList = async ()=>{
        const name = newListName.trim();
        if (!name) return;
        if (!user) return setError('Sign in as a coach to create lists.');
        setSaving('new');
        setError(null);
        const { data: list, error: createError } = await __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('coach_lists').insert({
            coach_id: user.id,
            name
        }).select('id, name').single();
        if (createError || !list) setError(createError?.message ?? 'Unable to create list.');
        else {
            const { error: memberError } = await __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('coach_list_members').insert({
                list_id: list.id,
                athlete_id: athleteId
            });
            if (memberError) setError(memberError.message);
            else {
                setLists((current)=>[
                        ...current,
                        list
                    ]);
                setMemberListIds((current)=>[
                        ...current,
                        list.id
                    ]);
                setNewListName('');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])('recruiting_list_action', {
                    action: 'list_created'
                });
            }
        }
        setSaving(null);
    };
    if (!ready || !isCoach) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: pickerRef,
        className: "relative",
        onClick: (event)=>event.stopPropagation(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: openPicker,
                className: `${prominent ? 'min-h-11 bg-emerald-600 px-4 py-2.5 text-sm text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 hover:bg-emerald-700' : 'border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-100'} inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition`,
                children: open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "size-4"
                        }, void 0, false, {
                            fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                            lineNumber: 146,
                            columnNumber: 17
                        }, this),
                        "Close lists"
                    ]
                }, void 0, true, {
                    fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                    lineNumber: 146,
                    columnNumber: 15
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListPlus$3e$__["ListPlus"], {
                            className: "size-4"
                        }, void 0, false, {
                            fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                            lineNumber: 146,
                            columnNumber: 60
                        }, this),
                        "Add to list"
                    ]
                }, void 0, true, {
                    fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                    lineNumber: 146,
                    columnNumber: 58
                }, this)
            }, void 0, false, {
                fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                lineNumber: 145,
                columnNumber: 5
            }, this),
            open && typeof document !== 'undefined' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: popoverRef,
                style: popoverPosition,
                className: "fixed z-50 max-h-[calc(100vh-2rem)] w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl shadow-slate-300/40",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-bold text-slate-950",
                        children: "Save this athlete"
                    }, void 0, false, {
                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                        lineNumber: 149,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs leading-5 text-slate-500",
                        children: "Choose an existing list or create a new one."
                    }, void 0, false, {
                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                        lineNumber: 150,
                        columnNumber: 7
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-sm text-slate-500",
                        children: "Loading lists…"
                    }, void 0, false, {
                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                        lineNumber: 151,
                        columnNumber: 18
                    }, this) : lists.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 space-y-2",
                        children: lists.map((list)=>{
                            const selected = memberListIds.includes(list.id);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: saving !== null,
                                onClick: ()=>toggleMembership(list),
                                className: `flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition disabled:opacity-60 ${selected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: list.name
                                    }, void 0, false, {
                                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                                        lineNumber: 151,
                                        columnNumber: 575
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: selected ? 'text-emerald-600' : 'text-slate-300',
                                        children: saving === list.id ? '…' : selected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            className: "size-4"
                                        }, void 0, false, {
                                            fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                                            lineNumber: 151,
                                            columnNumber: 726
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            className: "size-4"
                                        }, void 0, false, {
                                            fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                                            lineNumber: 151,
                                            columnNumber: 757
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                                        lineNumber: 151,
                                        columnNumber: 620
                                    }, this)
                                ]
                            }, list.id, true, {
                                fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                                lineNumber: 151,
                                columnNumber: 209
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                        lineNumber: 151,
                        columnNumber: 97
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500",
                        children: "You have not created any lists yet."
                    }, void 0, false, {
                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                        lineNumber: 151,
                        columnNumber: 815
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: newListName,
                                onChange: (event)=>setNewListName(event.target.value),
                                onKeyDown: (event)=>{
                                    if (event.key === 'Enter') createList();
                                },
                                placeholder: "New list name",
                                className: "input min-w-0 flex-1 text-sm",
                                maxLength: 80
                            }, void 0, false, {
                                fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                                lineNumber: 152,
                                columnNumber: 40
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: !newListName.trim() || saving !== null,
                                onClick: createList,
                                className: "rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50",
                                children: saving === 'new' ? '…' : 'Create'
                            }, void 0, false, {
                                fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                                lineNumber: 152,
                                columnNumber: 278
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                        lineNumber: 152,
                        columnNumber: 7
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "alert",
                        className: "mt-3 text-xs font-medium text-rose-600",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                        lineNumber: 153,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/statcard/src/components/AddToListButton.tsx",
                lineNumber: 148,
                columnNumber: 62
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/statcard/src/components/AddToListButton.tsx",
        lineNumber: 144,
        columnNumber: 10
    }, this);
}
_s(AddToListButton, "4JBKglg3zeCCB1DUEbn4xjDarac=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = AddToListButton;
var _c;
__turbopack_context__.k.register(_c, "AddToListButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/statcard/src/components/AddToListButton.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/statcard/src/components/AddToListButton.tsx [app-client] (ecmascript)"));
}),
"[project]/statcard/src/lib/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "trackEvent",
    ()=>trackEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@vercel/analytics/dist/index.mjs [app-client] (ecmascript)");
;
function trackEvent(event, properties) {
    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["track"])(event, properties);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0yomvo4._.js.map
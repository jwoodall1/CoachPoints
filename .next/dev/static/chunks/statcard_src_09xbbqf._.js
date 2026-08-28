(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/statcard/src/components/AuthProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            let active = true;
            // Read the persisted session once, then let the auth subscription keep it current.
            void __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession().then({
                "AuthProvider.useEffect": ({ data: { session } })=>{
                    if (!active) return;
                    setUser(session?.user ?? null);
                    setReady(true);
                }
            }["AuthProvider.useEffect"]);
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "AuthProvider.useEffect": (_event, session)=>{
                    setUser(session?.user ?? null);
                    setReady(true);
                }
            }["AuthProvider.useEffect"]);
            return ({
                "AuthProvider.useEffect": ()=>{
                    active = false;
                    subscription.unsubscribe();
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthProvider.useMemo[value]": ()=>({
                ready,
                user
            })
    }["AuthProvider.useMemo[value]"], [
        ready,
        user
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/statcard/src/components/AuthProvider.tsx",
        lineNumber: 45,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "V0gsWZN4is9/bNFkFVamm6kYdAM=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider.');
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/statcard/src/components/PresenceProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OnlineStatus",
    ()=>OnlineStatus,
    "PresenceProvider",
    ()=>PresenceProvider,
    "usePresence",
    ()=>usePresence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/components/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
const EMPTY_ONLINE_USERS = new Set();
const PresenceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    connected: false,
    onlineUserIds: EMPTY_ONLINE_USERS
});
function PresenceProvider({ children }) {
    _s();
    const { ready, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const userId = user?.id ?? null;
    const [onlineUserIds, setOnlineUserIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_ONLINE_USERS);
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PresenceProvider.useEffect": ()=>{
            if (!ready || !userId) {
                return;
            }
            let active = true;
            const channel = __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].channel('online-users', {
                config: {
                    private: true,
                    presence: {
                        key: userId
                    }
                }
            });
            const syncPresence = {
                "PresenceProvider.useEffect.syncPresence": ()=>{
                    if (!active) return;
                    const state = channel.presenceState();
                    const nextOnlineUsers = new Set();
                    for (const [presenceKey, metas] of Object.entries(state)){
                        const reportedUserId = metas.find({
                            "PresenceProvider.useEffect.syncPresence": (meta)=>meta.user_id
                        }["PresenceProvider.useEffect.syncPresence"])?.user_id;
                        nextOnlineUsers.add(reportedUserId ?? presenceKey);
                    }
                    setOnlineUserIds(nextOnlineUsers);
                }
            }["PresenceProvider.useEffect.syncPresence"];
            channel.on('presence', {
                event: 'sync'
            }, syncPresence).on('presence', {
                event: 'join'
            }, syncPresence).on('presence', {
                event: 'leave'
            }, syncPresence).subscribe({
                "PresenceProvider.useEffect": (status)=>{
                    if (!active) return;
                    if (status === 'SUBSCRIBED') {
                        setConnected(true);
                        void channel.track({
                            user_id: userId,
                            online_at: new Date().toISOString()
                        });
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        setConnected(false);
                    }
                }
            }["PresenceProvider.useEffect"]);
            return ({
                "PresenceProvider.useEffect": ()=>{
                    active = false;
                    setConnected(false);
                    setOnlineUserIds(EMPTY_ONLINE_USERS);
                    void channel.untrack();
                    void __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].removeChannel(channel);
                }
            })["PresenceProvider.useEffect"];
        }
    }["PresenceProvider.useEffect"], [
        ready,
        userId
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PresenceProvider.useMemo[value]": ()=>({
                connected,
                onlineUserIds
            })
    }["PresenceProvider.useMemo[value]"], [
        connected,
        onlineUserIds
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PresenceContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/statcard/src/components/PresenceProvider.tsx",
        lineNumber: 78,
        columnNumber: 10
    }, this);
}
_s(PresenceProvider, "OZMbvvwxoNv3CY4PqrbFAlTKfU4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = PresenceProvider;
function usePresence() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PresenceContext);
}
_s1(usePresence, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
function OnlineStatus({ userId, compact = false }) {
    _s2();
    const { connected, onlineUserIds } = usePresence();
    const isOnline = connected && onlineUserIds.has(userId);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1.5 whitespace-nowrap ${compact ? 'text-xs' : 'text-sm'} ${isOnline ? 'text-emerald-700' : 'text-slate-400'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": "true",
                className: `size-2 rounded-full ${isOnline ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'}`
            }, void 0, false, {
                fileName: "[project]/statcard/src/components/PresenceProvider.tsx",
                lineNumber: 91,
                columnNumber: 5
            }, this),
            isOnline ? 'Active now' : 'Offline'
        ]
    }, void 0, true, {
        fileName: "[project]/statcard/src/components/PresenceProvider.tsx",
        lineNumber: 90,
        columnNumber: 10
    }, this);
}
_s2(OnlineStatus, "B9dDkQzG8v7RNOr1GJQe7moy/FU=", false, function() {
    return [
        usePresence
    ];
});
_c1 = OnlineStatus;
var _c, _c1;
__turbopack_context__.k.register(_c, "PresenceProvider");
__turbopack_context__.k.register(_c1, "OnlineStatus");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/statcard/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/statcard/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://lntgnxrsmelbcslffohq.supabase.co/");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudGdueHJzbWVsYmNzbGZmb2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NzYxODEsImV4cCI6MjEwMjA1MjE4MX0.eoum8wgTewFSJelofElVVoxGHoufX-Jh4FXEUEHRmko");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=statcard_src_09xbbqf._.js.map
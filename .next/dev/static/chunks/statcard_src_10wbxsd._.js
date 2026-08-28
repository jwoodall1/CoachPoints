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
"[project]/statcard/src/components/MessageNavLink.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MessageNavLink
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/message-circle.mjs [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function MessageNavLink({ userId, mobile = false }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [unreadCount, setUnreadCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const active = pathname.startsWith('/messages');
    const refreshUnreadCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MessageNavLink.useCallback[refreshUnreadCount]": async ()=>{
            const { count, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('direct_messages').select('id', {
                count: 'exact',
                head: true
            }).eq('recipient_id', userId).is('read_at', null);
            if (!error) setUnreadCount(count ?? 0);
        }
    }["MessageNavLink.useCallback[refreshUnreadCount]"], [
        userId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MessageNavLink.useEffect": ()=>{
            void Promise.resolve().then(refreshUnreadCount);
            const channel = __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].channel(`nav-unread-messages-${userId}`).on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `recipient_id=eq.${userId}`
            }, refreshUnreadCount).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'direct_messages',
                filter: `recipient_id=eq.${userId}`
            }, refreshUnreadCount).subscribe();
            return ({
                "MessageNavLink.useEffect": ()=>{
                    void __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].removeChannel(channel);
                }
            })["MessageNavLink.useEffect"];
        }
    }["MessageNavLink.useEffect"], [
        refreshUnreadCount,
        userId
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: "/messages",
        "aria-current": active ? 'page' : undefined,
        className: `${mobile ? 'flex w-full px-3 py-3' : 'inline-flex min-h-10 px-3.5 py-2'} items-center gap-2 rounded-xl text-sm font-bold transition ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/statcard/src/components/MessageNavLink.tsx",
                lineNumber: 23,
                columnNumber: 322
            }, this),
            "Messages",
            unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-label": `${unreadCount} unread messages`,
                className: "ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-extrabold leading-4 text-white",
                children: unreadCount > 99 ? '99+' : unreadCount
            }, void 0, false, {
                fileName: "[project]/statcard/src/components/MessageNavLink.tsx",
                lineNumber: 23,
                columnNumber: 386
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/statcard/src/components/MessageNavLink.tsx",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
_s(MessageNavLink, "nQIb6TEYqDZqJBVveFYUt+HE8OY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = MessageNavLink;
var _c;
__turbopack_context__.k.register(_c, "MessageNavLink");
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
"[project]/statcard/src/components/SiteNav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SiteNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/layout-dashboard.mjs [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/list-checks.mjs [app-client] (ecmascript) <export default as ListChecks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/menu.mjs [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/user-round.mjs [app-client] (ecmascript) <export default as UserRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UsersRound$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/users-round.mjs [app-client] (ecmascript) <export default as UsersRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/statcard/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/components/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$MessageNavLink$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/components/MessageNavLink.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/statcard/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function SiteNav() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { ready, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [profileIdentity, setProfileIdentity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mobileOpen, setMobileOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const userId = user?.id ?? null;
    const accountType = user?.user_metadata.account_type === 'coach' ? 'coach' : 'athlete';
    const username = profileIdentity?.userId === userId ? profileIdentity.username : null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SiteNav.useEffect": ()=>{
            if (!ready || !userId) return;
            let active = true;
            const query = accountType === 'coach' ? __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('coachprofiles').select('username').eq('id', userId).maybeSingle() : __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('username').eq('id', userId).maybeSingle();
            void query.then({
                "SiteNav.useEffect": ({ data })=>{
                    if (active) setProfileIdentity({
                        userId,
                        username: data?.username ?? null
                    });
                }
            }["SiteNav.useEffect"]);
            return ({
                "SiteNav.useEffect": ()=>{
                    active = false;
                }
            })["SiteNav.useEffect"];
        }
    }["SiteNav.useEffect"], [
        accountType,
        ready,
        userId
    ]);
    const dashboardHref = accountType === 'coach' ? '/coach-dashboard' : '/dashboard';
    const items = [
        {
            href: dashboardHref,
            label: 'Dashboard',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"]
        },
        ...accountType === 'coach' ? [
            {
                href: '/coach-lists',
                label: 'Lists',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__["ListChecks"]
            }
        ] : [],
        {
            href: '/friends',
            label: 'Network',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UsersRound$3e$__["UsersRound"]
        }
    ];
    const signedIn = Boolean(ready && userId && username);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "page-shell",
            "aria-label": "Main navigation",
            onClick: (event)=>{
                if (event.target.closest('a')) setMobileOpen(false);
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-18 items-center justify-between gap-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex min-w-0 items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    "aria-label": "CoachPoints home",
                                    className: "group inline-flex shrink-0 items-center rounded-lg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: "/coachpoints-logo.png",
                                        alt: "CoachPoints",
                                        width: 190,
                                        height: 65,
                                        className: "h-20 w-auto object-contain transition group-hover:opacity-80",
                                        priority: true
                                    }, void 0, false, {
                                        fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                        lineNumber: 47,
                                        columnNumber: 166
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                    lineNumber: 47,
                                    columnNumber: 58
                                }, this),
                                signedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `hidden items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] sm:inline-flex ${accountType === 'coach' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-brand-50 text-brand-700'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `size-1.5 rounded-full ${accountType === 'coach' ? 'bg-emerald-500' : 'bg-brand-500'}`
                                        }, void 0, false, {
                                            fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                            lineNumber: 47,
                                            columnNumber: 622
                                        }, this),
                                        accountType
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                    lineNumber: 47,
                                    columnNumber: 347
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/statcard/src/components/SiteNav.tsx",
                            lineNumber: 47,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden items-center gap-1 lg:flex",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavLink, {
                                    href: "/",
                                    label: "Discover",
                                    active: pathname === '/'
                                }, void 0, false, {
                                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                    lineNumber: 48,
                                    columnNumber: 60
                                }, this),
                                signedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavLink, {
                                                ...item,
                                                active: pathname === item.href
                                            }, item.href, false, {
                                                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                                lineNumber: 48,
                                                columnNumber: 159
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$MessageNavLink$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            userId: userId
                                        }, void 0, false, {
                                            fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                            lineNumber: 48,
                                            columnNumber: 230
                                        }, this),
                                        username && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/${username}`,
                                            className: "ml-2 inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                                                    className: "size-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                                    lineNumber: 48,
                                                    columnNumber: 509
                                                }, this),
                                                "My profile"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                            lineNumber: 48,
                                            columnNumber: 278
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                    lineNumber: 48,
                                    columnNumber: 136
                                }, this),
                                ready && !userId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login?role=athlete",
                                    className: "ml-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700",
                                    children: "Get started"
                                }, void 0, false, {
                                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                    lineNumber: 48,
                                    columnNumber: 584
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/statcard/src/components/SiteNav.tsx",
                            lineNumber: 48,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setMobileOpen((open)=>!open),
                            className: "grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden",
                            "aria-expanded": mobileOpen,
                            "aria-controls": "mobile-navigation",
                            "aria-label": mobileOpen ? 'Close navigation' : 'Open navigation',
                            children: mobileOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "size-5"
                            }, void 0, false, {
                                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                lineNumber: 49,
                                columnNumber: 341
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                className: "size-5"
                            }, void 0, false, {
                                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                lineNumber: 49,
                                columnNumber: 368
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/statcard/src/components/SiteNav.tsx",
                            lineNumber: 49,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                    lineNumber: 46,
                    columnNumber: 7
                }, this),
                mobileOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    id: "mobile-navigation",
                    className: "border-t border-slate-100 pb-4 pt-3 lg:hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileLink, {
                                href: "/",
                                label: "Discover",
                                active: pathname === '/'
                            }, void 0, false, {
                                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                lineNumber: 51,
                                columnNumber: 136
                            }, this),
                            signedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileLink, {
                                            ...item,
                                            active: pathname === item.href
                                        }, item.href, false, {
                                            fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                            lineNumber: 51,
                                            columnNumber: 238
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$MessageNavLink$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        userId: userId,
                                        mobile: true
                                    }, void 0, false, {
                                        fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                        lineNumber: 51,
                                        columnNumber: 312
                                    }, this),
                                    username && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileLink, {
                                        href: `/${username}`,
                                        label: "My profile",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"],
                                        active: pathname === `/${username}`
                                    }, void 0, false, {
                                        fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                        lineNumber: 51,
                                        columnNumber: 367
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                lineNumber: 51,
                                columnNumber: 215
                            }, this),
                            ready && !userId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login?role=athlete",
                                    className: "btn-primary w-full",
                                    children: "Get started"
                                }, void 0, false, {
                                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                    lineNumber: 51,
                                    columnNumber: 524
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                                lineNumber: 51,
                                columnNumber: 502
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/statcard/src/components/SiteNav.tsx",
                        lineNumber: 51,
                        columnNumber: 108
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/statcard/src/components/SiteNav.tsx",
                    lineNumber: 51,
                    columnNumber: 22
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/statcard/src/components/SiteNav.tsx",
            lineNumber: 45,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/statcard/src/components/SiteNav.tsx",
        lineNumber: 44,
        columnNumber: 10
    }, this);
}
_s(SiteNav, "gQC80c5CmRa5WL6BPIfM/AL5bSw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = SiteNav;
function NavLink({ href, label, icon: Icon, active }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        "aria-current": active ? 'page' : undefined,
        className: `inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`,
        children: [
            Icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                lineNumber: 57,
                columnNumber: 286
            }, this),
            label
        ]
    }, void 0, true, {
        fileName: "[project]/statcard/src/components/SiteNav.tsx",
        lineNumber: 57,
        columnNumber: 10
    }, this);
}
_c1 = NavLink;
function MobileLink({ href, label, icon: Icon, active }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        "aria-current": active ? 'page' : undefined,
        className: `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`,
        children: [
            Icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$statcard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: "size-4.5"
            }, void 0, false, {
                fileName: "[project]/statcard/src/components/SiteNav.tsx",
                lineNumber: 61,
                columnNumber: 235
            }, this),
            label
        ]
    }, void 0, true, {
        fileName: "[project]/statcard/src/components/SiteNav.tsx",
        lineNumber: 61,
        columnNumber: 10
    }, this);
}
_c2 = MobileLink;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "SiteNav");
__turbopack_context__.k.register(_c1, "NavLink");
__turbopack_context__.k.register(_c2, "MobileLink");
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

//# sourceMappingURL=statcard_src_10wbxsd._.js.map
# TODO — Remove admin login logic

- [x] Edit server: remove admin login endpoint (`POST /api/auth/admin/login`) from `server/src/routes/auth.ts`.

- [x] Edit server: unmount admin router from `server/src/index.ts` so admin endpoints are unreachable.

- [x] Edit client: remove admin checkbox + admin login submit flow from `client/src/pages/Login.tsx`.

- [x] Edit client: remove `/admin/dashboard` route from `client/src/App.tsx`.

- [x] Edit client: remove admin-only “Queue” link from `client/src/components/Layout.tsx`.

- [x] Verify no remaining references to `/auth/admin/login` on client/server.

- [ ] Run TypeScript checks/builds (if available) for server and client.

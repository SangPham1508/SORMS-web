This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Admin Operations Module (FE) and API Notes

Routes:
- `/admin` Dashboard shell
- `/admin/rooms` Room Management
- `/admin/bookings` Booking Management
- `/admin/history` History Management

Structure:
- UI components: `src/components/admin/operations/*`
- Pages: `src/app/admin/*`
- Types: `src/lib/types.ts`
- API config & endpoints: `src/lib/config.ts`
- HTTP helper: `src/lib/http.ts`
- Services (switch mock -> BE): `src/lib/services/*`

How to point to your BE:
- Set `NEXT_PUBLIC_API_BASE_URL` in env (e.g. `.env.local`). Default: `http://localhost:4000/api`.
- Endpoints are centralized in `src/lib/config.ts` under `ENDPOINTS`. Adjust paths here only.

Switch from mock to real API:
- In `src/lib/services/*`, replace mock returns with the commented `http(...)` calls.
- Example:
  - Rooms list: `GET ENDPOINTS.rooms.list()` → returns `Room[]`
  - Create room: `POST ENDPOINTS.rooms.create()` with `Omit<Room, "id">`
  - Update room: `PATCH ENDPOINTS.rooms.update(id)` with partial room payload
  - Delete room: `DELETE ENDPOINTS.rooms.remove(id)`

Data contracts:
- `Room { id, name, type, capacity, status }` with `status ∈ {available, occupied, cleaning, maintenance}`
- `Booking { id, roomId, roomName, customerName, start, end, status }`
- `HistoryItem { id, customerId, customerName, type, timestamp, note? }`

Placeholder UI:
- RoomGrid shows a status badge and basics for each room.
- BookingChart lists bookings with date ranges.
- SimpleTable renders history records.

Notes:
- All pages use `export const dynamic = "force-dynamic";` to always fetch fresh data.
- Update only `ENDPOINTS` and service functions to integrate BE without touching pages.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

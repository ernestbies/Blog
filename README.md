# Blog

> **Educational project:** This is a university assignment created for learning purposes.
> That is why the compiled Angular frontend is committed directly in `public/` — the
> Angular sources are not part of this repository.

A small blog application: a Node.js/Express + MongoDB backend that serves a prebuilt
Angular frontend from the same server. It is set up to run **locally** — the frontend
calls the API through relative paths (`/api/...`), so no external hosting is required.

## Requirements

- **Node.js + npm** — the project dates from 2020 (Babel 6, Mongoose 5.9). If you hit
  errors on a very new Node release, switch to Node 16 LTS.
- **MongoDB** — local or Docker. Version **4.4** is the safest choice (the bundled
  `mongodb` 3.5 driver is not ready for the newest servers).

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (Docker example)
docker run -d --name blog-mongo -p 27017:27017 mongo:4.4

# 3. Create your local config and adjust it if needed (see below)
cp .env.example .env

# 4. Run the app
npm start
```

- UI: **http://localhost:3000**
- API: **http://localhost:3000/api/...**

For auto-restart during development (`nodemon` is in `devDependencies`):

```bash
npx nodemon index.js
```

`npm start` runs `node index.js`, which loads `.env` and then transpiles `import/export`
on the fly via `babel-core/register`.

## Configuration

Configuration lives in `config.js` and is read from environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `MONGODB_URI` | `''` | Full connection string **including the database name**, e.g. `mongodb://127.0.0.1:27017/blog` |
| `JWT_SECRET` | `secret` | Secret used to sign JWTs. The legacy misspelled name `JWT_SERCRET` is still accepted |

### Using `.env`

`.env` is ignored by git. Start by copying the committed template:

```bash
cp .env.example .env
```

The app reads `.env` automatically through `service/env.js` — **no `dotenv` dependency is
needed**.

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/blog
JWT_SECRET=change-me
```

Rules:

- variables already set in your shell **win over** `.env`,
- `.env` is read once at startup, so restart the app after editing it,
- `.env` is never committed — keep `.env.example` in sync when you add new variables.

Mongoose creates the collections (`eb_user`, `password`, `token`, `post`) on first write.
There is **no seed data** — create the first account through `/signup`.

If `MONGODB_URI` points nowhere, the server still starts, but API calls fail with a
database connection error.

## First steps

1. Open `/signup` and create an account (password length 5–15 characters).
2. Log in at `/login`.
3. `/blog` requires a logged-in user. Add posts with "Dodaj nowy post" (title, image URL,
   content). Images are not stored locally — the app renders them from the given URL.

## API

| Method | Path | Body / headers | Description |
|---|---|---|---|
| `GET` | `/api/posts` | — | List posts |
| `GET` | `/api/posts/:id` | — | Get one post |
| `POST` | `/api/posts/search` | `{ "content": "text" }` | Search post content |
| `POST` | `/api/posts` | `{ "title", "url", "content" }` | Create or update a post |
| `POST` | `/api/user/auth` | `{ "login", "password" }` | Log in — returns `{ token }` |
| `POST` | `/api/user/create` | `{ "name", "email", "password" }` | Register a user |
| `DELETE` | `/api/user/logout/:userId` | `x-auth-token` header | Log out |

Example:

```bash
curl -X POST http://localhost:3000/api/user/auth \
  -H "Content-Type: application/json" \
  -d '{"login":"user@example.com","password":"secret123"}'
```

## Project structure

```
app.js          # Express: serves public/, connects to MongoDB, wires routes
config.js       # configuration read from environment variables
index.js        # entrypoint: loads .env, registers Babel, starts the app
service/env.js  # tiny .env loader (shell variables take precedence)
REST/           # HTTP endpoints
business/       # manager layer
DAO/            # Mongoose models and data access
middleware/     # JWT auth
public/         # COMPILED Angular frontend (build artifact)
```

## About `public/`

`public/` contains an `ng build` output, **not** the Angular sources — those are not part
of this repository. The build is committed, so the UI works right after cloning. Without
`public/`, the API still works but `http://localhost:3000/` returns 404.

If you have the original Angular project, build it and copy the output into `public/`.
In the frontend sources, point the API base at relative paths (`''` for posts and `'/api'`
for users) instead of a hard-coded host.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| MongoDB connection error (`MongooseServerSelectionError`) | MongoDB is not running, or `MONGODB_URI` is wrong (it must include a database name) |
| `GET /` returns 404 while the API works | The `public/` build is missing |
| Login returns 401 | The account doesn't exist or the password is wrong — register via `/signup` |
| Token stops working after 3 hours | JWTs expire — log in again |
| `Cannot find module 'babel-core/register'` | Dependencies are not installed — run `npm install` |

## Caveats

This is a demo/learning project:

- passwords use unsalted SHA-1,
- the default JWT secret is `secret`,
- `POST /api/posts` is not protected by auth (the UI hides the blog, the API does not),
- the `/contact` form is static and sends nothing,
- there are no tests and no server-side input validation.

Don't use it as a base for a production application without fixing the above.

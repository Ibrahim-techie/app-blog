# notify

Appwrite Function that tells a post's author when someone likes or comments on
their post. The app never calls it: Appwrite runs it on these row events.

| Event | What it does |
| --- | --- |
| `tablesdb.<db>.tables.<likes>.rows.*.create` | Adds `like_<likeId>` for the post's author |
| `tablesdb.<db>.tables.<likes>.rows.*.delete` | Removes `like_<likeId>` (an unlike) |
| `tablesdb.<db>.tables.<comments>.rows.*.create` | Adds `comment_<commentId>` with the first 140 characters |

Nothing is written when an author likes or comments on their own post. Each
notification is readable, updatable and deletable by its recipient only, and
the `notifications` table itself grants nothing, so a browser can't create one.

## Settings

- Runtime: Node 22, entrypoint `src/main.js`, build command `npm install`
- Execute access: none (events only)
- Scopes: `rows.read`, `rows.write`
- Variables: `POSTS_TABLE_ID`, `LIKES_TABLE_ID`, `COMMENTS_TABLE_ID`,
  `NOTIFICATIONS_TABLE_ID`

## Deploying a change

From this folder, package and upload it as a new deployment:

```bash
tar -czf ../notify.tar.gz package.json src
```

Then in the Console: Functions → notify → Deployments → Create deployment →
Manual, upload `notify.tar.gz` and tick Activate. Executions and logs are under
the same function.

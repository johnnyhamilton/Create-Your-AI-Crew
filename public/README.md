# Public Static Assets

Files placed in this `public` directory are served directly from the root URL of the application.

### Examples:
- A PDF placed at `/public/user-guide.pdf` can be linked in your app or downloaded via `/user-guide.pdf`.
- A video placed at `/public/intro.mp4` can be played via `<video src="/intro.mp4" controls />`.

> **Note on Video Files:** Small videos can be stored here directly. For large videos, hosting on a dedicated video platform (like YouTube, Vimeo, Loom, or Google Cloud Storage) and embedding the URL is recommended to ensure fast loading and reliable streaming for users.

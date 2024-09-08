# Spotilisk

Goal of the app: Monitor liked songs in Spotify and sort them in playlists automatically.

## Architecture

The app is connecting to spotify web api through OAuth (Authorization Code with PKCE Flow) and interacting with it to retrieve the users's data (saved songs, playlists). It allows to add songs to playlists, with hopefully more features to come (add vs sync, daily auto-sync, sync with filters to different playlists...).

References:

- <https://developer.spotify.com/documentation/web-api/tutorials/getting-started>
- <https://developer.spotify.com/documentation/web-api/concepts/authorization>
- <https://blog.postman.com/pkce-oauth-how-to/>
- <https://developer.spotify.com/documentation/web-api/reference/add-tracks-to-playlist>

## Run locally in development mode

Running `docker compose up` without specifying the file will automatically take the `docker-compose.override.yml` into account:

    docker compose up -d --build
    docker compose down

Once started, you can access the application at <http://localhost:8090>.

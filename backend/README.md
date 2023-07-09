### Setup MySQL

Setup differs by machine, but ensure there is a user with username `root` and password `password`.

You may have to run this command before proceeding.

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

flush privileges ;
```

### Run the backend

In this (`backend/`) directory, first run `npm i` to install dependencies. Ensure the database is running with `npm run start-db` (only works if MySQL installed with homebrew). Then to run the actual server, run `npm run start`.

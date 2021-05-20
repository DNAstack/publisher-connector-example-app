# Publisher Example Connector

This repository contains the basic files for a Publisher connector.

# Quickstart

### Build

#### Login to Package Registry
This service relies on packages published to [GitHub Packages](https://github.com/features/packages). You will need to log into the registry by:

```
npm login --registry=https://npm.pkg.github.com --scope=@dnastack
```

**NOTE:** you need to create personal access token, when prompted use it as a password (see [github docs](https://docs.github.com/en/free-pro-team@latest/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages#authenticating-to-github-packages) for more info)


#### Build via Maven
```
./mvnw -Presolve-dependencies clean install
```

#### Manual build if maven build fails
```
nvm install 12.19.0
nvm use 12.19.0
npm login --registry=https://npm.pkg.github.com --scope=@dnastack
cd angular
rm -f package-lock.json
rm -rf node_modules
npm install
cd .. 
./mvnw clean install -DskipTests
```


### Database Connection - Setup Postgres

By default, the application will connect to a postgres instance running on localhost on the default port, and it
connects to a database with the name `exampleconnector` using a same name user & password. These values can be modified
through environment variables.

You can run postgres either in a docker container (if you do not have it locally) or installed locally on your machine.

#### Option 1: Docker Approach

```
docker run -d -p 5432:5432 --name exampleconnector -e POSTGRES_USER=exampleconnector -e POSTGRES_PASSWORD="exampleconnector" -e POSTGRES_DB=exampleconnector postgres
```

#### Option 2: Local Postgres Approach

* You can just install the `postgres` package on your OS if not present already:
    * Check if postgresql is already installed `brew services list`. If not, install postgresql `brew install postgresql`.
    * Start postgresql `brew services start postgresql`. Connect via psql `psql -h 127.0.0.1`
* Configure a user and a database
    ```
    CREATE USER exampleconnector PASSWORD 'exampleconnector' CREATEDB CREATEROLE;
    CREATE DATABASE exampleconnector OWNER exampleconnector;
    ```

### Run App

* If you already have wallet running, then nothing else is required! Otherwise, start the wallet application locally.
* Make sure the postgresql database is running.

#### Option 1: Command line

Use this command to start the service from repo root:

```
mvn clean spring-boot:run
```

#### Option 2: IntelliJ

Create a Spring Boot Run / Debug configuration with:

* `Name:` ExampleConnectorApplication
* `Main class:` com.dnastack.dlcon.exampleconnector.ExampleConnectorApplication
* `Environment variables:` (Omit these variables if you are using the default values)
    * SPRING_DATASOURCE_USERNAME=exampleconnector
    * SPRING_DATASOURCE_PASSWORD=exampleconnector
    * SPRING_DATASOURCE_URL=jdbc:postgresql://localhost/exampleconnector
* `Use classpath of module:` exampleconnector
* Check `Include dependencies with Provided scope`

```Note(for UI development): While developing locally, if the UI is not getting reflected even after refresh, run `npm run build:dev` from angular folder.```

### Quick Test

Create a valid wallet client id, and use that to generate bearer token. Using a valid bearer token as an auth header,
you should be able to access CRUD operations, such as:
GET: http://localhost:9110/connection-types. Otherwise, a 401 error will be given.

# Data Lake Connector Azure Blob Storage

This repository contains the internal service interface implementation for CRUD operations on Azure Blob Storage.

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

* `Name:` DLConAzureBlobStorageApplication
* `Main class:` com.dnastack.dlcon.azstorage.DLConAzStorageApplication
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
GET: http://localhost:8092/connection-types. Otherwise, a 401 error will be given.

# CI/CD - Building a deploy-able Docker image

All the CI scripts use Multi-stage builds for creating docker containers. The service is run as part of a CI/CD pipeline
where the CI server runs this to build the image. However, you can do it on your local machine to test the shell script
and Dockerfile. To build the associated docker images for the service, the e2e tests & pre-deploy, you can run the
following commands.

```
CONTAINER_REGISTRY=gcr.io/dnastack-container-store
VERSION=$(git describe -a)
NAME=dlcon-az-storage

./ci/build-docker-image "${CONTAINER_REGISTRY}/${NAME}:${VERSION}" "${NAME}" "${VERSION}"
./ci/build-docker-e2e-image "${CONTAINER_REGISTRY}/${NAME}:${VERSION}" "${NAME}" "${VERSION}"
./ci/build-docker-predeploy-image "${CONTAINER_REGISTRY}/${NAME}:${VERSION}" "${NAME}" "${VERSION}"
```

# Liquibase

All changes to the DB should be applied with
the [Liquibase changelog](src/main/resources/db/changelog/db.changelog-master.yaml). When in local development mode,
Liquibase is configured to automatically apply the changes against the local database. This behaviour is not desirable
in a CI/CD environment, since it can easily lead to deadlocks.

[TODO] In production the `predeploy` job should be used and the `spring.liquibase.enabled=false` property should be set.

# Swagger and OpenAPI

- Swagger: http://localhost:8092/docs/swagger-ui.html. If you provide a client ID and secret you can test out the API.
- OpenApi: http://localhost:8092/docs/openapi.json

# Testing

All E2E tests are written in Junit5 and located in the [e2e-tests](e2e-tests) directory.

* In your [IntelliJ IDE]
  * Copy the environment variables in e2e-tests.env. Fix the wallet client id & secret based on your values.
  * Right click on **_e2e-tests_** folder under **_dlcon-az-storage_** repo and click
    **_Debug Tests_** to create a Run/Debug Test configuration with following values:
    * `Name:` dlcon-az-storage-e2e-tests
    * `Test Kind:` All in package
    * `Environment variables:`(Paste the copied text from e2e-tests.env)
    * `Use classpath of module:` dlcon-az-storage-e2e-tests

# For Troubleshooting

## The change feed aggregator service can't decode AVRO files.

When the aggregator fails to decode AVRO files from `$blobchangefeed` (container), you will need to **regenerate** some
classes from an AVRO schema. However, while Microsoft does not provide the schema, the AVRO files in that container has
the schema embedded with the data.

To regenerate some classes necessary for decoding, you can just run:

```
python3 scripts/get_schema.py
```

The script will produce the schema file (`*.avsc`) in `src/main/avro` and Java files
in `src/main/java/Microsoft/Storage`.

> ## What is AVRO?
>
> **Apache AVRO** is a row-oriented
> remote procedure call and data serialization framework developed within
> Apache's Hadoop project. It uses JSON for defining data types and protocols,
> and serializes data in a compact binary format. Its primary use is in Apache
> Hadoop, where it can provide both a serialization format for persistent data,
> and a wire format for communication between Hadoop nodes, and from client programs
> to the Hadoop services. Avro uses a schema to structure the data that is being
> encoded. It has two different types of schema languages; one for human editing
> (Avro IDL) and another which is more machine-readable based on JSON.
>
> -- [Wikipedia](https://en.wikipedia.org/wiki/Apache_Avro)

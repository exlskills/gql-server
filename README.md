# EXLskills GraphQL API

## Requirements

You may be able to get away with more/less than what's described below, but we can't recommend anything outside of these options:

Operating Systems:
- Ubuntu 16.04
- OS X 10.13+
- Windows has not been thoroughly tested, although it has worked and should work... Windows-related contributions are welcome

Other Dependencies:
- MongoDB v3.4+ (Recommend v3.6+)
- NodeJS v8.10+
- NPM v6.1+

## Installation

```
git clone https://github.com/exlskills/gql-api

cd gql-api

npm install
```

## Running

MongoDB should be running

Set up generated files:

```
npm run update-schema
```

TODO discuss seeding data

Start a local server:

```
npm start
```

## GraphQL Schema

If at any time you make changes to `src/schema.js` or `src/relay-*/*.js`, stop the server,
regenerate `src/schema.graphql`, and restart the server:

```
npm run update-schema
npm start
```

GraphiQL: http://localhost:8080/graph

## License

This software is offered under the terms outlined in the [LICENSE.md](LICENSE.md) file provided with this notice. If you have any questions regarding the license, please contact [licensing@exlinc.com](mailto:licensing@exlinc.com)

## Enterprise / Commercial Licensing & Support

For enterprise licenses and/or support, please send an email enquiry to [enterprise@exlinc.com](mailto:enterprise@exlinc.com)

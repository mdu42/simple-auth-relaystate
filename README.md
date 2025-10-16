# simple-auth-relaystate


## prereq
- register a new application in your Entra tenant
- get the client ID
- register your redirect URI

## setup
modify public/auth.js and replace <CLIENT_ID> and <TENANT_ID> with your own value

## install
npm install

## run
npm start

## usage
- https://localhost:3000/?domain_hint=<a_federated_domain>&RelayState=<whatever_URL_you_want_to_land>
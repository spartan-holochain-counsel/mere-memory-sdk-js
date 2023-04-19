[![](https://img.shields.io/npm/v/@whi/mere-memory-sdk/latest?style=flat-square)](http://npmjs.com/package/@whi/mere-memory-sdk)

# Mere Memory SDK
A Javascript SDK for the Mere Memory Zome (Holochain).

[![](https://img.shields.io/github/issues-raw/mjbrisebois/mere-memory-sdk-js?style=flat-square)](https://github.com/mjbrisebois/mere-memory-sdk-js/issues)
[![](https://img.shields.io/github/issues-closed-raw/mjbrisebois/mere-memory-sdk-js?style=flat-square)](https://github.com/mjbrisebois/mere-memory-sdk-js/issues?q=is%3Aissue+is%3Aclosed)
[![](https://img.shields.io/github/issues-pr-raw/mjbrisebois/mere-memory-sdk-js?style=flat-square)](https://github.com/mjbrisebois/mere-memory-sdk-js/pulls)


## Overview

## Install

```bash
npm i @whi/mere-memory-sdk
```

## Usage

### Import
```javascript
import { MereMemoryClient } from '@whi/mere-memory-sdk';
```

### Simplest

```javascript
const client = new MereMemoryClient( app_port, cell_agent_hash, "storage", dna_hash );

client.setSigningHandler( async zome_call_request => {
    zome_call_request.signature = someSigningFunction( zome_call_request );
    return zome_call_request;
});

const memory_addr = await client.save( bytes );
const memory = await client.remember( memory_addr );

expect( memory ).to.deep.equal( bytes );
```



### Use Existing WebSocket

```javascript
import nacl from 'tweetnacl';

const socket = new WebSocket(`ws://127.0.0.1:${app_port}`);
socket.binaryType = "arraybuffer";

// Assuming CapGrant was already created with these credentials
const CAP_SECRET = "super_secret_password";
const key_pair = nacl.sign.keyPair();

const client = new MereMemoryClient( socket, cell_agent_hash, "storage", dna_hash );

client.setCapabilityAgent(
    cap_agent,
    async zome_call_request => {
        const zome_call_hash = await hashZomeCall( zome_call_request );

        zome_call_request.signature= nacl.sign( zome_call_hash, key_pair.secretKey )
            .subarray( 0, nacl.sign.signatureLength );

        return zome_call_request;
    },
    CAP_SECRET,
);

const memory_addr = await client.save( bytes );
const memory = await client.remember( memory_addr );

expect( memory ).to.deep.equal( bytes );
```


### API Reference

See [docs/API.md](docs/API.md)

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

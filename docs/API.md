[back to README.md](../README.md)

> Examples assume an understanding of [Holochain](https://www.holochain.org)
> [development](https://developer.holochain.org).

# API Reference

## `new MereMemoryClient( connection, agent, role_name, dna_hash )`
A class for communicating with Conductor's App interface with a specific Agent.

- `connection` - (*required*) either
  - an instance of [`Connection`](https://github.com/spartan-holochain-counsel/holochain-websocket-js/blob/master/docs/API_Connection.md)
  - or, it is used as the input for `new Connection( connection )`
- `agent` - (*required*) a 39 byte `Uint8Array` that is an `AgentPubKey`
- `role_name` - (*required*) a string of the role name for the cell with the mere memory zomes
- `dna_hash` - (*required*) a 39 byte `Uint8Array` that is an `DnaHash`

Example
```javascript
const cell_agent_hash = new Uint8Array([ ...39 bytes ]);
const dna_hash = new Uint8Array([ ...39 bytes ]);

const client = new MereMemoryClient( 12345, cell_agent_hash, "storage", dna_hash );
```


### `<MereMemoryClient>.save( bytes )`
Save the given byte array and return the `MemoryEntry` address.

- `bytes` - (*required*) a `Uint8Array`

Example
```javascript
await client.save( new Uint8Array([ ... ]) );
// new EntryHash([ ...39 bytes ]);
```


### `<MereMemoryClient>.remember( address )`
Reconstruct the saved bytes for the given `MemoryEntry` address.

- `address` - (*required*) a 39 byte `Uint8Array` that is an `EntryHash`

Example
```javascript
await client.remember( new Uint8Array([ ...39 bytes ]) );
// new Uint8Array([ ... ]);
```


### `<MereMemoryClient>.setSigningHandler( handler )`
Register a handler for signing zome calls.

- `handler` - (*required*) a function that receives the zome call input and returns the modified
  zome call input.

Example use-case for the Holochain Launcher
```javascript
const { invoke } = require('@tauri-apps/api/tauri');

client.setSigningHandler( async zome_call_request => {
    zome_call_request.provenance = Array.from( zome_call_request.provenance );
    zome_call_request.cell_id = [
        Array.from( zome_call_request.cell_id[0] ),
        Array.from( zome_call_request.cell_id[1] ),
    ];
    zome_call_request.payload = Array.from( zome_call_request.payload );
    zome_call_request.nonce = Array.from( zome_call_request.nonce );

    const signedZomeCall = await invoke("sign_zome_call", {
        "zomeCallUnsigned": zome_call_request,
    });

    signedZomeCall.cap_secret = null;
    signedZomeCall.provenance = Uint8Array.from( signedZomeCall.provenance );
    signedZomeCall.cell_id = [
        Uint8Array.from( signedZomeCall.cell_id[0] ),
        Uint8Array.from( signedZomeCall.cell_id[1] ),
    ];
    signedZomeCall.payload = Uint8Array.from( signedZomeCall.payload );
    signedZomeCall.signature = Uint8Array.from( signedZomeCall.signature || [] );
    signedZomeCall.nonce = Uint8Array.from( signedZomeCall.nonce );

    return signedZomeCall;
});
```


### `<MereMemoryClient>.setCapabilityAgent( agent, handler, secret )`
Register a handler for signing zome calls.

- `agent` - (*required*) a 39 byte `Uint8Array` that is an `AgentPubKey`
- `handler` - (*required*) a function that receives the zome call input and returns the modified
  zome call input.
- `secret` - (*optional*) a string used as the `cap_secret` value for all zome calls

```javascript
import nacl from 'tweetnacl';
import { hashZomeCall } from '@holochain/serialization');

const key_pair = nacl.sign.keyPair();

client.setCapabilityAgent(
    new AgentPubKey( key_pair.publicKey ),
    async zome_call_request => {
        const zome_call_hash = await hashZomeCall( zome_call_request );

        zome_call_request.signature	= nacl.sign( zome_call_hash, key_pair.secretKey )
            .subarray( 0, nacl.sign.signatureLength );

        return zome_call_request;
    }
});
```


### `<MereMemoryClient>.call( zome_function, args, timeout )`

- `zome_function` - (*required*) the zome function name
- `args` - (*optional*) the args corresponding to the zome function
- `timeout` - (*optional*) raise `TimeoutError` after # milliseconds
  - defaults to `this.options.timeout`

Example
```javascript
await client.call("create_memory_block", {
    "sequence": {
        "position": 1,
        "length": 1,
    },
    "bytes": new Uint8Array([ ... ]),
});
```


### `<MereMemoryClient>.close()`
Close the WebSocket connection.

> Will throw error if the WebSocket was passed in

Example
```javascript
await client.close();
```



## [`new Chunker( ... )`](./API_Chunker.md)
A class for breaking up large byte arrays into consumable chunks.



## Module exports
```javascript
{
    MereMemoryClient,
    Chunker,
}
```

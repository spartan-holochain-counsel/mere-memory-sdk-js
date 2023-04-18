[back to API.md](./API.md)


# API Reference for `Chunker` class

## `new Chunker( bytes, chunk_size )`
A class for breaking up large byte arrays into consumable chunks.

- `bytes` - (*required*) a `Uint8Array`
- `chunk_size` - (*optional*) a number used as the max chunk size
  - defaults to 2MB *(4MB is too big for Holochain entries)*

Example
```javascript
const chunks = new Chunker( bytes );

for ( let chunk of chunks ) {
    // do something with chunk of bytes
}
```

### `<Chunker>.length`
The number of chunks required to save the source bytes.

### `<Chunker>.chunkSize`
The maximum size of each chunk.

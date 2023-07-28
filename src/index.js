import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-basic", typeof process === "undefined" || process.env.LOG_LEVEL );

import {
    AgentClient,
    HoloHashes,
    logging,
}					from '@spartan-hc/holochain-agent-client';
import Essence				from '@whi/essence';

// logging();

const Interpreter			= new Essence.Translator();

export class Chunker {
    constructor ( bytes, chunk_size = 1024*1024*2 ) {
	if ( typeof bytes !== "object" || bytes === null )
	    throw new TypeError(`Expected byte input; not type '${typeof bytes}'`);
	if ( !(bytes instanceof Uint8Array) )
	    throw new TypeError(`Byte input must be Uint8Array; not type '${bytes.constructor.name}'`);

	this.__bytes			= bytes;
	this.__chunk_size		= chunk_size;
    }

    get length () {
	return Math.ceil( this.__bytes.length / this.__chunk_size );
    }

    get chunkSize () {
	return this.__chunk_size;
    }

    *iterator () {
	let index			= -1;

	while ( ((index+1) * this.__chunk_size) < this.__bytes.length ) {
	    index++;

	    let start			= index * this.__chunk_size;
	    let end			= Math.min( (index + 1) * this.__chunk_size, this.__bytes.length );

	    yield this.__bytes.slice( start, end );

	}
    }

    [Symbol.iterator]() {
	return this.iterator();
    }

    toString () {
	return `Chunker { length: ${this.length} }`;
    }

    toJSON () {
	return `Chunker { length: ${this.length} }`;
    }
}

export class MereMemoryClient {
    constructor ( connection, agent, role_name, dna_hash ) {
	this._client			= new AgentClient( agent, {
	    [role_name]: dna_hash,
	}, connection );

	this._client.addProcessor("output", (response, request) => {
	    log.debug("Parsing response type (%s) with metadata:", response.type, response.metadata );
	    const payload		= Interpreter.parse( response ).value();

	    if ( payload instanceof Error )
		throw payload;

	    return payload;
	});

	this._role_name			= role_name;
    }

    get client () {
	return this._client;
    }

    async call ( ...args ) {
	// log.trace("call", ...args );
	return await this._client.call( this._role_name, "mere_memory_api", ...args );
    }

    setSigningHandler ( ...args ) {
	this._client.setSigningHandler( ...args );
    }

    setCapabilityAgent ( ...args ) {
	this._client.setCapabilityAgent( ...args );
    }

    async save ( source ) {
	const chunks			= new Chunker( source );
	const block_addresses		= [];

	// TODO: use promise.all
	let position			= 1;
	for ( let chunk of chunks ) {
	    log.trace("Chunk %s/%s (%s bytes)", position, chunks.length, chunk.length.toLocaleString() );
	    let response		= await this.call( "create_memory_block", {
		"sequence": {
		    "position": position++,
		    "length": chunks.length,
		},
		"bytes": chunk,
	    });
	    block_addresses.push( new HoloHashes.HoloHash( response ) );
	}

	let hash			= new Array(32).fill(0);
	let response			= await this.call( "create_memory", {
	    hash,
	    block_addresses,
	    "memory_size":	source.length,
	});

	return new HoloHashes.HoloHash( response );
    }

    async remember ( addr ) {
	let memory			= await this.call( "get_memory", addr );

	const bytes			= new Uint8Array( memory.memory_size );

	let index			= 0;
	for ( let block_addr of memory.block_addresses ) {
	    const block			= await this.call( "get_memory_block", block_addr );
	    bytes.set( block.bytes, index );

	    index		       += block.bytes.length;
	}

	return bytes;
    }

    async close () {
	await this._client.close();
    }
}

export default {
    Chunker,
    MereMemoryClient,
}

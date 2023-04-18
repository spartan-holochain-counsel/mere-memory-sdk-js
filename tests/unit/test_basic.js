import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-basic", process.env.LOG_LEVEL );

import fs				from 'node:fs';
import path				from 'path';
import { expect }			from 'chai';

import { large_byte_array }		from '../utils.js';
import { Chunker }			from '../../src/index.js';



function chunker_tests () {
    it("should split large bytes into 2MB chunks", async () => {
	const bytes			= large_byte_array( 1024 * 3 );
	const chunks			= new Chunker( bytes )

	expect( chunks			).to.have.length( 2 );

	let slices			= [];
	for ( let chunk of chunks ) {
	    slices.push( chunk );
	}

	expect( slices			).to.have.length( 2 );

	const iter			= chunks.iterator();

	let iter1			= iter.next();
	let iter2			= iter.next();
	let iter3			= iter.next();

	expect( iter1.value		).to.be.a("Uint8Array");
	expect( iter1.value		).to.have.length( chunks.chunkSize );
	expect( iter2.value		).to.be.a("Uint8Array");
	expect( iter2.value		).to.have.length( chunks.chunkSize / 2 );
	expect( iter3.done		).to.be.true;

	const chunks_length		= iter1.value.length + iter2.value.length;

	expect( chunks_length		).to.equal( bytes.length );
    });
}

describe("Mere Memory JS", () => {

    describe("Chunker", chunker_tests );

});

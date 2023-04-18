import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-basic", process.env.LOG_LEVEL );

import why				from 'why-is-node-running';
import path				from 'path';
import nacl				from 'tweetnacl';
import { expect }			from 'chai';

import { AdminClient }			from '@whi/holochain-admin-client';
import { hashZomeCall }			from '@whi/holochain-agent-client';
import { Holochain }			from '@whi/holochain-backdrop';
import { AgentPubKey }			from '@whi/holo-hash';

import { large_byte_array,
	 expect_reject }		from '../utils.js';
import {
    Chunker,
    MereMemoryClient,
}					from '../../src/index.js';

// if ( process.env.LOG_LEVEL === "trace" )
//     logging();


const TEST_HAPP_PATH			= new URL( "../storage.happ", import.meta.url ).pathname;
const TEST_APP_ID			= "test-app";
const CAP_SECRET			= "super_secret_password";
const key_pair				= nacl.sign.keyPair();
const cap_agent				= new AgentPubKey( key_pair.publicKey );

let conductor;
let dna_hash;
let cell_agent_hash;
let app_port;


function client_tests () {
    let socket, client;
    let bytes, memory_addr;

    before(async () => {
	socket				= new WebSocket(`ws://127.0.0.1:${app_port}`);
	socket.binaryType		= "arraybuffer";
	client				= new MereMemoryClient( socket, cell_agent_hash, "storage", dna_hash );

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
    });

    it("should create memory", async function () {
	this.timeout( 10_000 );

	bytes				= large_byte_array( 1024 * 3 );
	memory_addr			= await client.save( bytes );

	expect( memory_addr		).to.be.a("EntryHash");
    });

    it("should get memory", async function () {
	this.timeout( 10_000 );

	const memory			= await client.remember( memory_addr );

	expect( memory			).to.be.a("Uint8Array");
	expect( memory			).to.have.length( bytes.length );
    });

    after(async () => {
	await socket.close()
    });
}

function errors_tests () {
    // memory size is different than combined block sizes
}

describe("Integration: Holochain Client", () => {

    before(async function () {
	this.timeout( 10_000 );

	conductor			= new Holochain({
	    "default_loggers": process.env.LOG_LEVEL === "trace",
	});

	await conductor.start();

	const port			= conductor.adminPorts()[0];
	const admin			= new AdminClient( port );
	cell_agent_hash			= await admin.generateAgent();;

	let installation		= await admin.installApp( TEST_APP_ID, cell_agent_hash, TEST_HAPP_PATH );
	await admin.enableApp( TEST_APP_ID );

	dna_hash			= installation.roles.storage.cell_id[0];

	log.info("Creating cap grant with secret: %s", CAP_SECRET );
	await admin.grantTransferableCapability( "testing", cell_agent_hash, dna_hash, "*", CAP_SECRET );

	let app_iface			= await admin.attachAppInterface();
	app_port			= app_iface.port;

	await admin.close();
    });

    describe("Mere Memory Client",	client_tests );
    describe("Errors",			errors_tests );

    after(async () => {
	await conductor.destroy();

	// setTimeout( () => why(), 1000 );
    });

});

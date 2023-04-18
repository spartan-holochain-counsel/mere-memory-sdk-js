
import crypto				from 'crypto';
import { expect }			from 'chai';


export function large_byte_array ( kilobyte_length ) {
    const rand_kilobyte			= crypto.randomBytes( 1024 );
    return new Uint8Array( [].concat( ...Array( kilobyte_length ).fill( [...rand_kilobyte] ) ) );
}


export async function expect_reject ( cb, error, message ) {
    let failed				= false;
    try {
	await cb();
    } catch (err) {
	failed				= true;
	expect( () => { throw err }	).to.throw( error, message );
    }
    expect( failed			).to.be.true;
}

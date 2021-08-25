import { apis, TIMEOUT_MS, ACTOR, ACCOUNT, CONCURRENCY, AUTHORIZATION, CPU_ACTOR } from "./src/config"
import { timeout, transact } from "./src/utils"
import { Action } from "eosjs/dist/eosjs-serialize";
import { createHash } from 'crypto';
import PQueue from 'p-queue';

function randomDigest() {
    return createHash('sha256').update(String(randomNumber())).digest('hex');
}

function randomNumber() {
    return Math.floor(Math.random() * 10000);
}

function mine2( ): Action {
    return {
        account: ACCOUNT,
        name: "mine2",
        authorization: AUTHORIZATION,
        data: {
            executor: ACTOR,
            digest: randomDigest(),
        }
    };
};

function mine( ): Action {
    return {
        account: ACCOUNT,
        name: "mine",
        authorization: AUTHORIZATION,
        data: {
            executor: ACTOR,
            nonce: randomNumber(),
        }
    };
};

async function task(queue: PQueue<any, any>, worker: number ) {
    await transact(apis[worker], [ mine2() ], worker);
    await timeout(TIMEOUT_MS);
    queue.add(() => task(queue, worker));
}

async function start( worker: number ) {
    const queue = new PQueue({concurrency: CONCURRENCY});
    for ( let i = 0; i < CONCURRENCY; i++ ) {
        queue.add(() => task(queue, worker));
        await timeout(TIMEOUT_MS);
    }
    await queue.onIdle();
};

async function validate () {
    // check RPC connections
    const valid_connections = new Map<string, true>();
    let tries = 3;
    while ( valid_connections.size < apis.length ) {
        tries--;
        for ( let i = apis.length-1; i >=0; i-- ) {
            const rpc = apis[i].rpc;
            // skip if valide
            if ( valid_connections.has( rpc.endpoint )) continue;
            try {
                // RPC endpoint must be able to respond
                await rpc.get_info();
                valid_connections.set(rpc.endpoint, true);
                console.error( "✅ OK endpoint:", rpc.endpoint );
            } catch (e) {
                if (tries || rpc.endpoint.indexOf("localhost") != -1) {
                    console.error( "❌ ERROR with RPC endpoint:", rpc.endpoint );
                    await timeout(5000);
                }
                else {
                    apis.splice(i, 1);
                    console.error( "🛑 RPC endpoint removed:", rpc.endpoint );
                }
            }
        }
    }
    // validate EOS accounts
    is_account_valid(ACTOR);
    is_account_valid(CPU_ACTOR);
}

async function is_account_valid( account: string ) {
    try {
        await apis[0].rpc.get_account(account);
    } catch (e) {
        for ( const details of e.json?.error?.details ) {
            console.error("🛑 " + details.message);
        }
        throw new Error("🛑 Invalid EOS account: " + account)
    }
}

async function boot() {
    await validate();

    // initiate workers
    for ( let worker = 0; worker < apis.length; worker++ ) {
        console.error( "🤖 inititate worker", worker );
        start( worker );
    }
}

boot();
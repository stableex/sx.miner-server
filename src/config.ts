import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { Headers } from 'node-fetch';
const { TextEncoder, TextDecoder } = require('util');
require("dotenv").config();

// REQUIRED configurations
if (!process.env.ACTOR) throw new Error("process.env.ACTOR is required");
if (!process.env.PRIVATE_KEYS) throw new Error("process.env.PRIVATE_KEYS is required");
export const ACTOR = process.env.ACTOR;
export const HEADERS = process.env.HEADERS;

function fetch(url, params = {} ) {
    if ( !HEADERS ) return require('node-fetch')( url, params );
    return require('node-fetch')(url, Object.assign(params, { headers: new Headers(JSON.parse(HEADERS)) }));
}

// OPTIONAL configurations
export const NODEOS_ENDPOINTS = process.env.NODEOS_ENDPOINTS || "http://localhost:8888"
export const CPU_ACTOR = process.env.CPU_ACTOR || ACTOR;
export const CONCURRENCY = Number(process.env.CONCURRENCY || 5);
export const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 10);
export const ACCOUNT = process.env.ACCOUNT || "push.sx";
export const AUTHORIZATION = parse_authorization([ CPU_ACTOR, ACTOR ]);
export const VERBOSE = process.env.VERBOSE && (process.env.VERBOSE.toLowerCase() == "true" || process.env.VERBOSE.toLowerCase() == "yes") || false;

// validate .env settings
if (CPU_ACTOR.match(/[<>]/)) throw new Error("process.env.CPU_ACTOR is invalid");
if (ACTOR.match(/[<>]/)) throw new Error("process.env.ACTOR is invalid");
if (process.env.PRIVATE_KEYS.match(/[<>]/)) throw new Error("process.env.PRIVATE_KEYS is invalid");

// EOSIO RPC & API
const signatureProvider = new JsSignatureProvider(process.env.PRIVATE_KEYS.split(","));
export const apis = NODEOS_ENDPOINTS.split(",").map(endpoint => {
    const rpc = new JsonRpc(endpoint, { fetch });
    return new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
});

function parse_authorization( authorizations: string[] ) {
    const exists = new Set<string>();
    const permissions = [];
    for ( const authorization of authorizations ) {
        if (!authorization) continue;
        const [actor, permission ] = authorization.split("@");
        if (exists.has( actor )) continue; // prevent duplicates
        permissions.push({ actor, permission: permission || "active" });
        exists.add( actor );
    }
    return permissions;
}

export const LOG_NORMAL_FAILS = [
    ': [',
    'Profits under',
    'hft.sx: best profit',
    'Swap amount too small',
    'already claimed rewards',
    'no unpacking available',
    'distribute: not ready yet',
    'deadline exceeded',
    'handle_next_push: not ready yet',
    'on_mine: insufficient balance',
    'liq.sx healthy account',
    'proxy::claimall: nothing to claim',
    'proxy::updateall: nothing to update',
    'atomichub.sx::mine: nothing to buy',
    'atomichub.sx::mine: nothing to sell',
    'already claimed in the last 24h',
    'mine::updateall: nothing to update'
]
// usage: node seal.mjs <lockcode-file> <data.json> <outdir>
import {webcrypto as wc} from 'node:crypto'; import fs from 'node:fs';
const s=wc.subtle, b64=b=>Buffer.from(b).toString('base64'), d64=x=>new Uint8Array(Buffer.from(x,'base64'));
const [,,lockFile,dataFile,out]=process.argv;
const raw=fs.readFileSync(lockFile,'utf8').trim().replace(/^CFO-LOCK:/,'');
const lock=JSON.parse(Buffer.from(raw,'base64').toString());
const pub=await s.importKey('spki',d64(lock.pub),{name:'ECDH',namedCurve:'P-256'},false,[]);
const eph=await s.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']);
const key=await s.deriveKey({name:'ECDH',public:pub},eph.privateKey,{name:'AES-GCM',length:256},false,['encrypt']);
const iv=wc.getRandomValues(new Uint8Array(12));
const ct=await s.encrypt({name:'AES-GCM',iv},key,fs.readFileSync(dataFile));
fs.writeFileSync(out+'/lock.json',JSON.stringify(lock));
fs.writeFileSync(out+'/data.enc.json',JSON.stringify({v:1,epk:b64(await s.exportKey('spki',eph.publicKey)),iv:b64(iv),ct:b64(ct)}));
console.log('sealed',fs.statSync(out+'/data.enc.json').size,'bytes');

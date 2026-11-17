# CFO tracker (password-locked web version of Jason's CFO Tracker Excel)

**Never commit unencrypted financial data to this repo.** It is public. Only `lock.json` and `data.enc.json` (ciphertext) may hold data.

## Files
- `index.html` — the app. Asks for a password, decrypts `data.enc.json`, renders. App code holds no personal numbers.
- `setup.html` — one-time page where Jason sets his password in his own browser. It outputs a lock code (`CFO-LOCK:...`) that he pastes to Claude. The password never leaves his browser.
- `seal.mjs` — `node seal.mjs <lockcode-file> <data.json> <outdir>` writes `lock.json` + `data.enc.json`. Claude can encrypt without knowing the password (ECDH P-256 public key; private key is stored wrapped with PBKDF2-SHA256 600k + AES-GCM).
- `lock.json` — the lock code, decoded. Reuse it for every update (save it to a file, strip nothing: seal.mjs accepts the raw JSON base64 or the lock.json content re-encoded). To reseal: `node -e "process.stdout.write(Buffer.from(require('fs').readFileSync('lock.json')).toString('base64'))" > /tmp/lock.txt` then `node seal.mjs /tmp/lock.txt data.json .`

## Updating
Claude cannot read the current data (it's encrypted). For an update, Jason uploads his latest CFO Tracker .xlsx; rebuild `data.json` from it (schema below, keep out of git), run seal.mjs, commit only `data.enc.json`. Test locally first: unlocking needs the password, so test app changes with a throwaway lock made via setup.html in a local headless browser.

## data.json schema
updated, snapshot (strings) · income{gross,insOffset,netPaycheck,paychecks} · bonus[[label,text]] · fixed[[name,amount,"m"|"y"]] · variable[[name,monthly]] ·
accounts[[name,balance|null,"invested"|"cash",note]] · debts[[name,amount]] · ef/prop{balance,target,targetDate"YYYY-MM",rate,perPaycheck,from[,note]} ·
roth{year,ytd,limit,perPaycheck,start"YYYY-MM-DD"} · checkingFloor, checking · payFirst"YYYY-MM-DD", payDays, planEnd ·
subs[[name,category,"Monthly"|"Annual",costPerBill,status,note]] · contrib[[date,account,amount,type,note]] ·
nw{months[],rows[[name,[values],isInvested 1|0]],contribBetween[]} · deals[{name,price,units,rentOther,rentYours,hoa,loan,rate,term,tax,ins,util,closing,seller,reserves,vac,rep,capex,pm}] · dealNote ·
areas[] · areaInfo[[label,[values]]] · scores[[factor,weight,[scores]]] · actions[[title,text]] · notes[[title,text]]

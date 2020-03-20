# API cache using Cloudflare Workers and KV

This repository contains a rudimentary cache suitable for APIs or similar endpoints.

It has three functions:

- `Get` (expects `x-api-key` header to be passed to origin; easy to remove if you don't like it)
- `Delete`
- `List`

## Prerequisites

Since this uses [Cloudflare Workers](https://workers.cloudflare.com) and [KV](https://www.cloudflare.com/products/workers-kv/), you need to have a Cloudflare account. Workers can be used in a free account, however KV cannot. For that you will need Workers Unlimited (\$5/month).

I assume you have [Wrangler](https://github.com/cloudflare/wrangler) installed.

Also make sure to rename `wranglerdottoml` to `wrangler.toml` and set all the empty fields to your own values. Make sure to set the "name" field to different names between the three files so they don't conflict. Then copy the files to their respective function folders.

## Develop and test

Run `wrangler dev` in the respective subfolders. This does not currently support KV functionality though!

I would recommend just logging into Cloudflare and using the "quick edit" view for any development work.

## Deployment

**Standard way**: Run `wrangler publish` in the respective subfolders.

I've added a few helpers in `package.json` if you get weary of running Wrangler manually:

- `deploy`: Deploy all three functions
- `deploy:delete`: Deploy `delete` function
- `deploy:get`: Deploy `get` function
- `deploy:list`: Deploy `list` function

Run like regular NPM stuff, eg. `npm run deploy`.

## Resources

- [Wrangler on GitHub](https://github.com/cloudflare/wrangler)
- [Reference: KV API](https://developers.cloudflare.com/workers/reference/apis/kv/)

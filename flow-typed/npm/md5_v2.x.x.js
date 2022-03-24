// flow-typed signature: b6e13411b287f2b16372e09f5e37f8ec
// flow-typed version: c6154227d1/md5_v2.x.x/flow_>=v0.104.x

// @flow

declare module "md5" {
  declare module.exports: (
    message: string | Buffer,
    options?: {
      asString?: boolean,
      asBytes?: boolean,
      encoding?: string,
      ...
    }
  ) => string;
}

// Compiled using typings@0.6.8
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/56295f5058cac7ae458540423c50ac2dcf9fc711/jsonwebtoken/jsonwebtoken.d.ts
// Type definitions for jsonwebtoken 5.7.0
// Project: https://github.com/auth0/node-jsonwebtoken
// Definitions by: Maxime LUCE <https://github.com/SomaticIT>, Daniel Heim <https://github.com/danielheim>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped


declare module "jsonwebtoken" {

    export interface SignOptions {
        /**
         * Signature algorithm. Could be one of these values :
         * - HS256:    HMAC using SHA-256 hash algorithm
         * - HS384:    HMAC using SHA-384 hash algorithm
         * - HS512:    HMAC using SHA-512 hash algorithm
         * - RS256:    RSASSA using SHA-256 hash algorithm
         * - RS384:    RSASSA using SHA-384 hash algorithm
         * - RS512:    RSASSA using SHA-512 hash algorithm
         * - ES256:    ECDSA using P-256 curve and SHA-256 hash algorithm
         * - ES384:    ECDSA using P-384 curve and SHA-384 hash algorithm
         * - ES512:    ECDSA using P-521 curve and SHA-512 hash algorithm
         * - none:     No digital signature or MAC value included
         */
        algorithm?: string;
        /**
         *@deprecated - see expiresIn
         *@member {number} - Lifetime for the token in minutes
         */
        expiresInMinutes?: number;
        /** @member {string} - Lifetime for the token expressed in a string describing a time span [rauchg/ms](https://github.com/rauchg/ms.js). Eg: `60`, `"2 days"`, `"10h"`, `"7d"` */
        expiresIn?: string;
        notBefore?: string;
        audience?: string;
        subject?: string;
        issuer?: string;
        jwtid?: string;
        noTimestamp?: boolean;
        headers?: Object;
    }

    export interface VerifyOptions {
        algorithms?: string[];
        audience?: string;
        issuer?: string;
        ignoreExpiration?: boolean;
        ignoreNotBefore?: boolean;
        subject?: string;
        /**
         *@deprecated
         *@member {string} - Max age of token
         */
        maxAge?: string;
    }

    export interface DecodeOptions {
      complete?: boolean;
      json?: boolean;
    }

    export interface VerifyCallback {
        (err: Error, decoded: any): void;
    }

    export interface SignCallback {
        (encoded: string): void;
    }

    /**
     * Synchronously sign the given payload into a JSON Web Token string
     * @param {String|Object|Buffer} payload - Payload to sign, could be an literal, buffer or string
     * @param {String|Buffer} secretOrPrivateKey - Either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
     * @param {SignOptions} [options] - Options for the signature
     * @returns {String} The JSON Web Token string
     */
    export function sign(payload: string | Buffer | Object, secretOrPrivateKey: string | Buffer, options?: SignOptions): string;

    /**
     * Sign the given payload into a JSON Web Token string
     * @param {String|Object|Buffer} payload - Payload to sign, could be an literal, buffer or string
     * @param {String|Buffer} secretOrPrivateKey - Either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
     * @param {SignOptions} [options] - Options for the signature
     * @param {Function} callback - Callback to get the encoded token on
     */
    export function sign(payload: string | Buffer | Object, secretOrPrivateKey: string | Buffer, callback: SignCallback): void;
    export function sign(payload: string | Buffer | Object, secretOrPrivateKey: string | Buffer, options: SignOptions, callback: SignCallback): void;

    /**
     * Synchronously verify given token using a secret or a public key to get a decoded token
     * @param {String} token - JWT string to verify
     * @param {String|Buffer} secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
     * @param {VerifyOptions} [options] - Options for the verification
     * @returns The decoded token.
     */
    function verify(token: string, secretOrPublicKey: string | Buffer): any;
    function verify(token: string, secretOrPublicKey: string | Buffer, options?: VerifyOptions): any;

    /**
     * Asynchronously verify given token using a secret or a public key to get a decoded token
     * @param {String} token - JWT string to verify
     * @param {String|Buffer} secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
     * @param {VerifyOptions} [options] - Options for the verification
     * @param {Function} callback - Callback to get the decoded token on
     */
    function verify(token: string, secretOrPublicKey: string | Buffer, callback?: VerifyCallback): void;
    function verify(token: string, secretOrPublicKey: string | Buffer, options?: VerifyOptions, callback?: VerifyCallback): void;

    /**
     * Returns the decoded payload without verifying if the signature is valid.
     * @param {String} token - JWT string to decode
     * @param {DecodeOptions} [options] - Options for decoding
     * @returns {Object} The decoded Token
     */
    function decode(token: string, options?: DecodeOptions): any;
}
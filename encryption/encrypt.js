const crypto = require('crypto')

function encrypt(message, pubkeypath)
{
    
    /*AES*/
    let AES_IV = crypto.randomBytes(16); // initialization vector
    let AES_key = crypto.randomBytes(32); // 32 bytes = 256 bit AES key
    //let AES_buffer = new Buffer(AES_key, 'binary');
    let AES_buffer = new Buffer(AES_key, 'hex');
    let AES_cipher = crypto.createCipheriv('aes-256-gcm', AES_key, AES_IV); // create actual AES cipher
    let AES_ciphertext = AES_cipher.update(message, 'utf8', 'hex'); // encrypt message with AES
    AES_ciphertext += AES_cipher.final('hex'); // prevent cipher from being used again 
    //console.log(AES_ciphertext);

    /*HMAC*/
    let HMAC_key = crypto.randomBytes(32); // 32 bytes = 256 bit HMAC key
    let HMAC_hash = crypto.createHash('sha256');
    HMAC_hash.update(HMAC_key);
    HMAC_key = HMAC_hash.digest();

    /*HMAC TAG*/
    // let HMAC_buffer = new Buffer(HMAC_key, 'binary');
    let HMAC_buffer = new Buffer(HMAC_key, 'hex');
    let HMAC = crypto.createHmac('sha256', HMAC_buffer);
    HMAC.update(AES_ciphertext); // compute integrity of ciphertext
    let HMAC_tag = HMAC.digest('hex'); // prevent hmac object from being used again

    /*RSA - public key*/
    //let RSA_keybuffer = new Buffer(pubkeypath, 'binary');
    //let pubkeypath = path.resolve('../keys/public.pem'); might not need this
    //let pubkey = fs.readFileSync(pubkeypath, 'utf8');
    let RSA_keybuffer = new Buffer(pubkeypath, 'hex'); // read public key from path
    //RSA_keybuffer = RSA_keybuffer.toString();
    let RSA_buffer = Buffer.concat([AES_buffer, HMAC_buffer]); // concatenate AES and HMAC keys
    // Note: publicEncrypt will automatically use RSA_PKCS1_OAEP_PADDING if first argument is a string
    let RSA_ciphertext = crypto.publicEncrypt(RSA_keybuffer, RSA_buffer); // encrypt concatenated keys with public key
    
    /*JSON FORMAT OUTPUT*/
    let output =
    {
        "RSA_ciphertext" : RSA_ciphertext,
        "AES_ciphertext" : AES_ciphertext,
        "AES_IV" : AES_IV,
        "HMAC_tag" : HMAC_tag
    };

    return output;

}

function decrypt(message, privkeypath)
{
    let plaintext = "";

    /*Extract from JSON*/
    let RSA_ciphertext = message.RSA_ciphertext;
    let AES_ciphertext = message.AES_ciphertext;
    let AES_IV = message.AES_IV;
    let HMAC_tag = message.HMAC_tag;

    /*RSA - private key*/
    //let privkeypath = path.resolve('../keys/private.pem'); might not need this
    let privkey = fs.readFileSync(privkeypath, 'utf8');
    //let RSA_keybuffer = new Buffer(privkey, 'binary');
    let RSA_keybuffer = new Buffer(privkey, 'hex');

    /*Decrypt RSA*/
    RSA_ciphertext = Buffer(RSA_ciphertext);
    let RSA_plaintext = crypto.privateDecrypt(RSA_keybuffer, RSA_ciphertext);

    /*Extracting AES and HMAC keys*/
    let keyLength = Buffer.byteLength(RSA_plaintext, 'hex') / 2;
    let AES_key = Buffer.alloc(keyLength, 'hex');
    RSA_plaintext.copy(AES_key, 0, 0, keyLength);
    let HMAC_key = Buffer.alloc(keyLength, 'hex');
    RSA_plaintext.copy(HMAC_key, 0, keyLength, keyLength*2);

    /*HMAC verification*/
    let HMAC = crypto.createHmac('sha256', HMAC_key);
    AES_ciphertext = Buffer(AES_ciphertext);
    HMAC.update(AES_ciphertext); // recompute integrity tag
    let HMAC_tag2 = HMAC.digest('hex'); // this is the HMAC tag for this AES ciphertext

    if (HMAC_tag === HMAC_tag2)
    {
        AES_IV = Buffer(AES_IV);
        let AES_decrypt = crypto.createDecipheriv('aes-256-gcm', AES_key, AES_IV);
        let AES_plaintext = AES_decrypt.update(AES_ciphertext);
        AES_plaintext = Buffer.concat([AES_plaintext, AES_decrypt.final()]);
        plaintext = AES_plaintext.toString();
    }
    else
    {
        console.log("Something went wrong...");
    }

    return plaintext;
}

module.exports = {encrypt, decrypt};
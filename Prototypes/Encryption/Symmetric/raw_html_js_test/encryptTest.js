var someBytes = "hej jag gillar fisk";
//var someBytes = "02a502f1ab3569c8753e5c0ee22da54116a2e17cae180e4aa4302c381192af7f";

var forge = require('node-forge');
// generate a random key and IV
// Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
//var key = "68656a206a61672067696c6c6172206669736b";
var key = forge.random.getBytesSync(16);
var iv = forge.random.getBytesSync(16);

/* alternatively, generate a password-based 16-byte key
var salt = forge.random.getBytesSync(128);
var key = forge.pkcs5.pbkdf2('password', salt, numIterations, 16);
*/

// encrypt some bytes using CBC mode
// (other modes include: ECB, CFB, OFB, CTR, and GCM)
// Note: CBC and ECB modes use PKCS#7 padding as default
var cipher = forge.cipher.createCipher('AES-CBC', key);
cipher.start({iv: iv});
cipher.update(forge.util.createBuffer(someBytes));
cipher.finish();
var encrypted = cipher.output;
// outputs encrypted hex
console.log("encrypted: " + encrypted.toHex());

// decrypt some bytes using CBC mode
// (other modes include: CFB, OFB, CTR, and GCM)
var decipher = forge.cipher.createDecipher('AES-CBC', key);
decipher.start({iv: iv});
decipher.update(encrypted);
decipher.finish();
var decrypted = decipher.output;
// outputs decrypted hex
console.log("decrypted: " + decrypted);

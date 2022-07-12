// source: https://libsodium.gitbook.io/doc/public-key_cryptography/sealed_boxes
import * as sodium from "libsodium-wrappers";

export class SealedCryptoBox {
  private keypair: sodium.KeyPair;

  constructor(keypair: sodium.KeyPair) {
    this.keypair = keypair;
  }

  public static keygen(seed?: Uint8Array) {
    if (seed) {
      return new this(sodium.crypto_box_seed_keypair(seed));
    }
    return new this(sodium.crypto_box_keypair());
  }

  public static fromPrivkey(privkey: Uint8Array) {
    return new this({
      keyType: "x25519",
      privateKey: privkey,
      publicKey: sodium.crypto_scalarmult_base(privkey),
    });
  }

  public static to_uint8array(value: string | Uint8Array): Uint8Array {
    return typeof value === "string"
      ? sodium.from_base64(value, sodium.base64_variants.URLSAFE)
      : value;
  }

  public static encrypt(
    message: Uint8Array | string,
    publicKey: Uint8Array | string
  ): string {
    const encodedMessage = sodium.crypto_box_seal(
      message,
      this.to_uint8array(publicKey)
    );
    return sodium.to_base64(encodedMessage, sodium.base64_variants.URLSAFE);
  }

  public static decrypt(
    cipher: Uint8Array | string,
    publicKey: Uint8Array | string,
    privateKey: Uint8Array | string
  ): string {
    const decodedMessage = sodium.crypto_box_seal_open(
      cipher,
      this.to_uint8array(publicKey),
      this.to_uint8array(privateKey)
    );
    return sodium.to_base64(decodedMessage, sodium.base64_variants.URLSAFE);
  }

  public get publicKey() {
    return sodium.to_base64(
      this.keypair.publicKey,
      sodium.base64_variants.URLSAFE
    );
  }

  public get privateKey() {
    return sodium.to_base64(
      this.keypair.privateKey,
      sodium.base64_variants.URLSAFE
    );
  }
}

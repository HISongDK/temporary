import CryptoJS from 'crypto-js';

/**
 * AES加密/解密
 */

class AESInfo {
	//密钥
	keyStr = 'ascstechcitywork';
	config = {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	};
	//加密
	encrypt(word) {
		if (!word) return null;
		const key = CryptoJS.enc.Utf8.parse(this.keyStr);
		const srcs = CryptoJS.enc.Utf8.parse(word);
		const encrypted = CryptoJS.AES.encrypt(srcs, key, this.config);
		return encrypted;
	}
	//解密
	decrypt(word) {
		if (!word) return null;
		const key = CryptoJS.enc.Utf8.parse(this.keyStr);
		const decrypt = CryptoJS.AES.decrypt(word, key, this.config);
		return CryptoJS.enc.Utf8.stringify(decrypt);
	}
}

export const AES = new AESInfo();

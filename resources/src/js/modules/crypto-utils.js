/**
 * 加密工具模块 - 用于API密钥等敏感信息的加密和解密
 */

class CryptoUtils {
    /**
     * 使用AES-GCM算法加密数据
     * @param {string} plaintext - 要加密的文本
     * @param {string} passphrase - 加密密码
     * @returns {Promise<string>} - 返回加密后的字符串
     */
    static async encrypt(plaintext, passphrase) {
        try {
            // 从密码生成密钥
            const keyMaterial = await this._getKeyMaterial(passphrase);
            const key = await this._deriveKey(keyMaterial);
            
            // 创建初始化向量
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // 加密数据
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(plaintext);
            
            const encryptedContent = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv
                },
                key,
                encodedData
            );
            
            // 将IV和加密内容合并并转换为Base64
            const encryptedArray = new Uint8Array(iv.length + encryptedContent.byteLength);
            encryptedArray.set(iv);
            encryptedArray.set(new Uint8Array(encryptedContent), iv.length);
            
            return btoa(String.fromCharCode.apply(null, encryptedArray));
        } catch (error) {
            console.error('加密失败:', error);
            throw new Error('加密操作失败');
        }
    }
    
    /**
     * 解密AES-GCM加密的数据
     * @param {string} encryptedData - 加密的数据字符串
     * @param {string} passphrase - 解密密码
     * @returns {Promise<string>} - 返回解密后的文本
     */
    static async decrypt(encryptedData, passphrase) {
        try {
            // 从Base64转换回二进制数据
            const encryptedArray = new Uint8Array(
                atob(encryptedData).split('').map(char => char.charCodeAt(0))
            );
            
            // 提取IV和加密内容
            const iv = encryptedArray.slice(0, 12);
            const encryptedContent = encryptedArray.slice(12);
            
            // 从密码生成密钥
            const keyMaterial = await this._getKeyMaterial(passphrase);
            const key = await this._deriveKey(keyMaterial);
            
            // 解密数据
            const decryptedContent = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv
                },
                key,
                encryptedContent
            );
            
            // 转换为文本
            const decoder = new TextDecoder();
            return decoder.decode(decryptedContent);
        } catch (error) {
            console.error('解密失败:', error);
            throw new Error('解密操作失败');
        }
    }
    
    /**
     * 从密码生成密钥材料
     * @private
     */
    static async _getKeyMaterial(passphrase) {
        const encoder = new TextEncoder();
        return await crypto.subtle.importKey(
            "raw",
            encoder.encode(passphrase),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
    }
    
    /**
     * 从密钥材料派生加密密钥
     * @private
     */
    static async _deriveKey(keyMaterial) {
        // 使用固定的盐值（在生产环境中应该使用随机盐值并存储）
        const salt = new TextEncoder().encode("resource-activation-site-salt");
        
        return await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }
    
    /**
     * 生成安全的随机密码
     * @param {number} length - 密码长度
     * @returns {string} - 生成的随机密码
     */
    static generateSecurePassword(length = 16) {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);
        
        let result = "";
        for (let i = 0; i < length; i++) {
            result += charset[randomValues[i] % charset.length];
        }
        
        return result;
    }
}

export default CryptoUtils;
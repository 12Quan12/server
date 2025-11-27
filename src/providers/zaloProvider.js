import { env } from "~/config/environment";

const axios = require("axios")
const CryptoJS = require("crypto-js")
const crypto = require("crypto");
const fs = require("fs")

class Zalo {
    constructor() {
        this.params = {
            imei: env.IMEI,
            computer_name: "Web",
            language: "vi",
            ts: Date.now()
        }
        this.client_Id = Date.now()
        // this.keyWordArray = this.getSecretKey("MnTs/EpnZU2JYazFKm/gYQ==")
        this.keyWordArray = null
        this.secret_key = env.SECRET_KEY
        this.headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            cookie: env.COOKIE_ZALO,
            "Referer": "https://chat.zalo.me/"
        }
    }

    wordArrayToBuffer(words, sigBytes) {
        const buf = Buffer.alloc(sigBytes);
        let offset = 0;
        for (let w of words) {
            buf.writeInt32BE(w, offset);
            offset += 4;
        }
        return buf;
    }

    encodeAES(key, plaintext, ivhex = null) {
        if (!plaintext) return null;
        // ---- KEY ----
        let keyBuf;
        if (typeof key === "string") {
            // CryptoJS.Utf8.parse equivalent
            const wa = CryptoJS.enc.Utf8.parse(key);
            keyBuf = this.wordArrayToBuffer(wa.words, wa.sigBytes);
        } else {
            // key is WordArray
            keyBuf = this.wordArrayToBuffer(key.words, key.sigBytes);
        }

        // ---- IV ----
        let ivBuf;
        if (ivhex) {
            ivBuf = Buffer.from(ivhex, "hex");
        } else {
            ivBuf = Buffer.alloc(16, 0); // 16 bytes zero
        }

        // ---- Algorithm ----
        const algo = `aes-${keyBuf.length * 8}-cbc`; // aes-128-cbc or aes-256-cbc

        // ---- Encrypt ----
        const cipher = crypto.createCipheriv(algo, keyBuf, ivBuf);
        cipher.setAutoPadding(true);

        const encrypted = Buffer.concat([
            cipher.update(plaintext, "utf8"),
            cipher.final()
        ]);

        // ---- Return Base64 (CryptoJS style) ----
        return encrypted.toString("base64");
    }

    decodeAES(key, ciphertext, ivhex = null, retry = 0) {
        if (!ciphertext) return null;

        try {
            // 1. decodeURIComponent giống Zalo
            ciphertext = decodeURIComponent(ciphertext);

            // 2. Key xử lý
            if (typeof key === "string") {
                // key dạng chuỗi → Utf8.parse
                key = CryptoJS.enc.Utf8.parse(key);
            } else {
                // key = WordArray { words, sigBytes }
                // giữ nguyên (CryptoJS dùng trực tiếp WordArray)
                key = CryptoJS.lib.WordArray.create(key.words, key.sigBytes);
            }

            // 3. IV
            const iv = ivhex
                ? CryptoJS.enc.Hex.parse(ivhex)
                : CryptoJS.lib.WordArray.create([0, 0, 0, 0], 16); // 16 byte 0

            // 4. ciphertext CryptoJS format
            const cipherParams = {
                ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
                salt: ""
            };

            // 5. AES decrypt (CBC + PKCS7)
            const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            // 6. Trả UTF-8 string
            return decrypted.toString(CryptoJS.enc.Utf8);

        } catch (err) {

            if (retry < 3)
                return decodeAES(key, ciphertext, ivhex, retry + 1);

            console.error(err);
            return null;
        }
    }

    r(e, r, n) {
        for (var i = [], o = 0, a = 0; a < r; a++)
            if (a % 4) {
                var s = n[e.charCodeAt(a - 1)] << a % 4 * 2
                    , c = n[e.charCodeAt(a)] >>> 6 - a % 4 * 2;
                i[o >>> 2] |= (s | c) << 24 - o % 4 * 8,
                    o++
            }
        this.keyWordArray = {
            words: i,
            sigBytes: o
        }
    }

    getSecretKey() {
        let e = this.secret_key
        var t = e.length
            , n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
            , i = [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                62,
                null,
                null,
                null,
                63,
                52,
                53,
                54,
                55,
                56,
                57,
                58,
                59,
                60,
                61,
                null,
                null,
                null,
                64,
                null,
                null,
                null,
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                null,
                null,
                null,
                null,
                null,
                null,
                26,
                27,
                28,
                29,
                30,
                31,
                32,
                33,
                34,
                35,
                36,
                37,
                38,
                39,
                40,
                41,
                42,
                43,
                44,
                45,
                46,
                47,
                48,
                49,
                50,
                51
            ]
        if (!i) {
            i = this._reverseMap = [];
            for (var o = 0; o < n.length; o++)
                i[n.charCodeAt(o)] = o
        }
        var a = n.charAt(64);
        if (a) {
            var s = e.indexOf(a);
            -1 !== s && (t = s)
        }
        return this.r(e, t, i)
    }

    // async get_login_info() {
    //     return new Promise(async (resolve, reject) => {
    //         const enc_parms = new SignParams(this.params)
    //         const { url, key } = enc_parms.sign()
    //         await axios.get(url, { headers: this.headers })
    //             .then(res => resolve(this.decodeAES(key, res.data.data)))
    //             .catch(err => reject(null))
    //     })
    // }


    async search_phone(phone) {
        return new Promise(async (resolve, reject) => {
            const params = this.encodeAES(this.keyWordArray, JSON.stringify({
                "phone": phone,
                "avatar_size": 240,
                "language": "vi",
                "imei": this.params.imei,
                "reqSrc": 85
            }))
            let url = `https://tt-friend-wpa.chat.zalo.me/api/friend/profile/get?zpw_ver=670&zpw_type=30&params=${encodeURIComponent(params)}`
            await axios.get(url, { headers: this.headers })
                .then(res => resolve(res))
                .catch(err => reject(null))
        })
    }

    async send_messager_to_thread(messages, thread_id) {
        return new Promise((resolve, reject) => {
            const url = "https://tt-chat4-wpa.chat.zalo.me/api/message/sms?zpw_ver=670&zpw_type=30&nretry=0";
            const paramsEncrypted = this.encodeAES(
                this.keyWordArray,
                JSON.stringify({
                    "message": messages,
                    "clientId": this.client_Id,
                    "imei": this.params.imei,
                    "ttl": 0,
                    "toid": thread_id
                })
            );
            const body = `params=${encodeURIComponent(paramsEncrypted)}`;
            const headers_ = {
                ...this.headers,
                "content-type": "application/x-www-form-urlencoded"
            };
            axios.post(url, body, { headers: headers_ })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async get_group_thread() {
        return new Promise((resolve, reject) => {
            let url = `https://tt-group-wpa.chat.zalo.me/api/group/getlg/v4?zpw_ver=670&zpw_type=30`
            axios.get(url, { headers: this.headers })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async get_last_message() {
        return new Promise(async (resolve, reject) => {
            const params = this.encodeAES(this.keyWordArray, JSON.stringify({
                "threadIdLocalMsgId": "{}",
                "imei": this.params.imei
            }))
            let url = `https://tt-convers-wpa.chat.zalo.me/api/preloadconvers/get-last-msgs?zpw_ver=670&zpw_type=30&params=${encodeURIComponent(params)}`
            await axios.get(url, { headers: this.headers })
                .then(res => resolve(res))
                .catch(err => reject(null))
        })
    }

    async get_cloud_data(groupId = "2744683408423383994") {
        return new Promise(async (resolve, reject) => {
            const params = this.encodeAES(this.keyWordArray, JSON.stringify({
                "groupId": groupId,
                "globalMsgId": 0,
                "count": 50,
                "msgIds": [],
                "imei": this.params.imei,
                "isOA": 1,
                "src": 3
            }))
            let url = `https://tt-group-cm.chat.zalo.me/api/cm/getrecentv2?zpw_ver=670&zpw_type=30&params=${encodeURIComponent(params)}&nretry=0`
            await axios.get(url, { headers: this.headers })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async get_friends() {
        return new Promise(async (resolve, reject) => {
            const params = this.encodeAES(this.keyWordArray, JSON.stringify({
                "incInvalid": 1,
                "page": 1,
                "count": 20000,
                "avatar_size": 120,
                "actiontime": 0,
                "imei": this.params.imei
            }))
            let url = `https://tt-profile-wpa.chat.zalo.me/api/social/friend/getfriends?zpw_ver=670&zpw_type=30&params=${encodeURIComponent(params)}&nretry=0`
            await axios.get(url, { headers: this.headers })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async get_groups_detail(grid) {
        return new Promise((resolve, reject) => {
            const url = "https://tt-group-wpa.chat.zalo.me/api/group/getmg-v2?zpw_ver=670&zpw_type=30";
            const paramsEncrypted = this.encodeAES(
                this.keyWordArray,
                JSON.stringify({ gridVerMap: JSON.stringify(grid) })
            );
            const body = `params=${encodeURIComponent(paramsEncrypted)}`;
            const headers_ = {
                ...this.headers,
                "content-type": "application/x-www-form-urlencoded"
            };
            axios.post(url, body, { headers: headers_ })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async get_infomation_members(mems_id) {
        /**
         * example mems_id = [
            "911883028058794250_0",
            "8222106284110424759_0",
            "977760314716577340_0",
            "5027703031416144488_0",
            "5611610734284697421_0",
           ]
         * 
         */
        return new Promise((resolve, reject) => {
            const url = "https://tt-profile-wpa.chat.zalo.me/api/social/group/members?zpw_ver=670&zpw_type=30";
            const paramsEncrypted = this.encodeAES(
                this.keyWordArray,
                JSON.stringify({
                    friend_pversion_map: mems_id
                })
            );
            const body = `params=${encodeURIComponent(paramsEncrypted)}`;
            const headers_ = {
                ...this.headers,
                "content-type": "application/x-www-form-urlencoded"
            };
            axios.post(url, body, { headers: headers_ })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async create_group(name, members) {
        /**
         * example members = [
            "911883028058794250_0",
            "8222106284110424759_0",
            "977760314716577340_0",
            "5027703031416144488_0",
            "5611610734284697421_0",
           ]
         * 
         */
        return new Promise(async (resolve, reject) => {
            const params = this.encodeAES(this.keyWordArray, JSON.stringify({
                "clientId": this.client_Id,
                "gname": name,
                "gdesc": null,
                "members": members,
                "memberTypes": [
                    -1,
                    -1
                ],
                "nameChanged": 1,
                "createLink": 1,
                "clientLang": "vi",
                "imei": this.params.imei,
                "groupType": 1,
                "zsource": 601
            }))
            let url = `https://tt-group-wpa.chat.zalo.me/api/group/create/v2?zpw_ver=670&zpw_type=30&params=${encodeURIComponent(params)}`
            await axios.get(url, { headers: this.headers })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async get_message_groups(groupId, globalMsgId = "10000000000000000") {
        return new Promise(async (resolve, reject) => {
            const params = this.encodeAES(this.keyWordArray, JSON.stringify({
                "groupId": groupId,
                "globalMsgId": globalMsgId,
                "count": 50,
                "msgIds": [],
                "imei": this.params.imei,
                "src": 1
            }))
            let url = `https://tt-group-cm.chat.zalo.me/api/cm/getrecentv2?zpw_ver=670&zpw_type=30&params=${encodeURIComponent(params)}&nretry=0`
            await axios.get(url, { headers: this.headers })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    async send_messager_to_group(messages, group_id) {
        return new Promise((resolve, reject) => {
            const url = "https://tt-group-wpa.chat.zalo.me/api/group/sendmsg?zpw_ver=670&zpw_type=30&nretry=0";
            const paramsEncrypted = this.encodeAES(
                this.keyWordArray,
                JSON.stringify({
                    "message": messages,
                    "clientId": this.client_Id,
                    "imei": this.params.imei,
                    "ttl": 0,
                    "visibility": 0,
                    "grid": group_id
                })
            );
            const body = `params=${encodeURIComponent(paramsEncrypted)}`;
            const headers_ = {
                ...this.headers,
                "content-type": "application/x-www-form-urlencoded"
            };
            axios.post(url, body, { headers: headers_ })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }
}

export const zaloProvider = Zalo
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.uploadFile = uploadFile;
exports.downloadFile = downloadFile;
exports.deleteFile = deleteFile;
const env_1 = require("../config/env");
const crypto_1 = require("crypto");
let authCache = null;
function sha1(buffer) {
    return (0, crypto_1.createHash)("sha1").update(buffer).digest("hex");
}
async function authorize() {
    if (authCache && Date.now() < authCache.expiresAt - 30000) {
        return authCache;
    }
    const res = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
        method: "GET",
        headers: {
            Authorization: "Basic " +
                Buffer.from(`${env_1.env.B2_KEY_ID}:${env_1.env.B2_APPLICATION_KEY}`).toString("base64"),
            Accept: "application/json",
        },
    });
    if (!res.ok) {
        throw new Error("B2 authorize failed: " + res.status);
    }
    const data = await res.json();
    authCache = {
        authorizationToken: data.authorizationToken,
        apiUrl: data.apiInfo.storageApi.apiUrl,
        downloadUrl: data.apiInfo.storageApi.downloadUrl,
        expiresAt: Date.now() + 3 * 60 * 60 * 1000,
    };
    return authCache;
}
async function uploadFile(storageKey, buffer, contentType) {
    const auth = await authorize();
    const uploadUrlRes = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url`, {
        method: "POST",
        headers: {
            Authorization: auth.authorizationToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ bucketId: env_1.env.B2_BUCKET_ID }),
    });
    if (!uploadUrlRes.ok)
        throw new Error("B2 get upload url failed: " + uploadUrlRes.status);
    const uploadData = await uploadUrlRes.json();
    const uploadRes = await fetch(uploadData.uploadUrl, {
        method: "POST",
        headers: {
            Authorization: uploadData.authorizationToken,
            "X-Bz-File-Name": encodeURIComponent(storageKey),
            "Content-Type": contentType,
            "X-Bz-Content-Sha1": sha1(buffer),
            "Content-Length": String(buffer.length),
        },
        body: buffer,
    });
    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error("B2 upload failed: " + uploadRes.status + " " + text);
    }
    const result = await uploadRes.json();
    return { fileId: result.fileId, storageKey };
}
async function downloadFile(storageKey) {
    const auth = await authorize();
    const url = `${auth.downloadUrl}/file/${env_1.env.B2_BUCKET_NAME}/${encodeURIComponent(storageKey)}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: auth.authorizationToken,
        },
    });
    if (!res.ok)
        throw new Error("B2 download failed: " + res.status);
    return res.body;
}
async function deleteFile(fileName, fileId) {
    const auth = await authorize();
    const res = await fetch(`${auth.apiUrl}/b2api/v3/b2_delete_file_version`, {
        method: "POST",
        headers: {
            Authorization: auth.authorizationToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName, fileId }),
    });
    if (!res.ok)
        throw new Error("B2 delete failed: " + res.status);
}

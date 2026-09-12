import { env } from "../config/env";
import { createHash } from "crypto";

interface AuthCache {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  expiresAt: number;
}

let authCache: AuthCache | null = null;

function sha1(buffer: Buffer): string {
  return createHash("sha1").update(buffer).digest("hex");
}

export async function authorize() {
  if (authCache && Date.now() < authCache.expiresAt - 30000) {
    return authCache;
  }

  const res = await fetch(
    "https://api.backblazeb2.com/b2api/v3/b2_authorize_account",
    {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${env.B2_KEY_ID}:${env.B2_APPLICATION_KEY}`
          ).toString("base64"),
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("B2 authorize failed: " + res.status);
  }

  const data: any = await res.json();

  authCache = {
    authorizationToken: data.authorizationToken,
    apiUrl: data.apiInfo.storageApi.apiUrl,
    downloadUrl: data.apiInfo.storageApi.downloadUrl,
    expiresAt: Date.now() + 3 * 60 * 60 * 1000,
  };

  return authCache;
}

export async function uploadFile(storageKey: string, buffer: Buffer, contentType: string) {
  const auth = await authorize();
  const uploadUrlRes = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId: env.B2_BUCKET_ID }),
  });
  if (!uploadUrlRes.ok) throw new Error("B2 get upload url failed: " + uploadUrlRes.status);
  const uploadData: any = await uploadUrlRes.json();

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
  const result: any = await uploadRes.json();
  return { fileId: result.fileId, storageKey };
}

export async function downloadFile(storageKey: string) {
  const auth = await authorize();
  const url = `${auth.downloadUrl}/file/${env.B2_BUCKET_NAME}/${encodeURIComponent(storageKey)}`;
  const res = await fetch(url, {
  method: "GET",
  headers: {
    Authorization: auth.authorizationToken,
  },
});
  if (!res.ok) throw new Error("B2 download failed: " + res.status);
  return res.body;
}

export async function deleteFile(fileName: string, fileId: string) {
  const auth = await authorize();
  const res = await fetch(`${auth.apiUrl}/b2api/v3/b2_delete_file_version`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, fileId }),
  });
  if (!res.ok) throw new Error("B2 delete failed: " + res.status);
}

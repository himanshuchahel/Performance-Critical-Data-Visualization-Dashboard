interface AuthCache {
    authorizationToken: string;
    apiUrl: string;
    downloadUrl: string;
    expiresAt: number;
}
export declare function authorize(): Promise<AuthCache>;
export declare function uploadFile(storageKey: string, buffer: Buffer, contentType: string): Promise<{
    fileId: any;
    storageKey: string;
}>;
export declare function downloadFile(storageKey: string): Promise<import("stream/web").ReadableStream<any> | null>;
export declare function deleteFile(fileName: string, fileId: string): Promise<void>;
export {};

export declare class StorageService {
    private dir;
    constructor();
    save(filename: string, buffer: Buffer): string;
    get(filePath: string): Buffer;
    delete(filePath: string): void;
}

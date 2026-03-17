import { ApiService } from './apiService';
interface SyncResult {
    success: boolean;
    error?: string;
    syncedItems?: number;
}
export declare class SyncService {
    private apiService;
    constructor(apiService: ApiService);
    sync(): Promise<SyncResult>;
    private extractExerciseId;
}
export {};
//# sourceMappingURL=syncService.d.ts.map
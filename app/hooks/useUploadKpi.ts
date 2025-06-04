"use client";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function useUploadKpi() {
    const qc = useQueryClient();
    const [progress, setProgress] = useState<number>(0);

    const mutation = useMutation({
        mutationFn: async (file: File) => {
            return new Promise<{ uploadId: string }>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/ingest');
                xhr.responseType = 'json';
                xhr.upload.onprogress = e => {
                    if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
                };
                xhr.onload = () => (xhr.status < 400 ? resolve(xhr.response) : reject(xhr.response));
                xhr.onerror = () => reject(new Error('network'));
        
                const fd = new FormData();
                fd.append('file', file);
                xhr.send(fd);
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['kpis'] });   // 一覧を再取得
            setProgress(0);
        }
    });

    return { ...mutation, progress };
}
import React, { useMemo } from 'react';

export interface MediaData {
  images: File[];
  imageUrls: string[];
  videos: File[];
  videoUrls: string[];
}

export interface UploadProgress {
  [key: string]: number;
}

interface Props {
  data: MediaData;
  onChange: (value: MediaData) => void;
  uploadProgress: UploadProgress;
  disabled?: boolean;
}

export default function MediaStep({ data, onChange, uploadProgress, disabled }: Props) {
  const imageList = useMemo(() => data.imageUrls.join('\n'), [data.imageUrls]);
  const videoList = useMemo(() => data.videoUrls.join('\n'), [data.videoUrls]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Image URLs</span>
        <textarea
          className="mt-1 block w-full rounded-md border p-2"
          value={imageList}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, imageUrls: event.target.value.split('\n').filter(Boolean) })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Video URLs</span>
        <textarea
          className="mt-1 block w-full rounded-md border p-2"
          value={videoList}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, videoUrls: event.target.value.split('\n').filter(Boolean) })}
        />
      </label>
      <div className="grid gap-2 md:grid-cols-2">
        {Object.entries(uploadProgress).map(([key, progress]) => (
          <div key={key} className="rounded-lg border bg-slate-50 p-3 text-sm">
            <strong>{key}</strong>
            <div>{progress}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

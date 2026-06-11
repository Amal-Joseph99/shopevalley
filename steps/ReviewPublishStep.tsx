import React from 'react';

interface Props {
  onPublish: () => void;
  onSaveDraft: () => void;
  disabled?: boolean;
}

export default function ReviewPublishStep({ onPublish, onSaveDraft, disabled }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-slate-50 p-4">
        <p className="text-sm font-semibold">Publish options</p>
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            disabled={disabled}
            onClick={onPublish}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Publish now
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onSaveDraft}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save draft
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500">Drafts can be resumed later. Interrupted drafts older than 24 hours must be completed by an admin.</p>
    </div>
  );
}

"use client";

import {useCallback} from 'react';
import {useDropzone, FileRejection} from 'react-dropzone';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {useImagesStore} from '@/stores/images';

export function ImageUploadDropzone() {
  const t = useTranslations('Uploader');
  const addFiles = useImagesStore((s) => s.addFiles);
  const addError = useImagesStore((s) => s.addError);
  const clearErrors = useImagesStore((s) => s.clearErrors);
  const errors = useImagesStore((s) => s.errors);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      clearErrors();
      if (acceptedFiles.length) {
        addFiles(acceptedFiles);
      }
      if (fileRejections.length) {
        fileRejections.forEach((rej) => {
          addError(t('invalidType', {name: rej.file.name}));
        });
      }
    },
    [addFiles, addError, clearErrors, t]
  );

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    }
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps({className: 'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/40'})}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? t('dropHere') : t('subtitle')}
        </p>
        <div className="mt-3">
          <Button type="button" variant="outline" onClick={open}>
            {t('browse')}
          </Button>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <div className="font-medium mb-1">{t('errorTitle')}</div>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

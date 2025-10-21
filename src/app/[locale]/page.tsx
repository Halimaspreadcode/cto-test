import {getTranslations} from 'next-intl/server';
import {Button} from '@/components/ui/button';
import {Counter} from '@/components/counter';

import {ImageUploadDropzone} from '@/components/image-upload-dropzone';
import {PreviewGrid} from '@/components/preview-grid';
import {ImageEditor} from '@/components/editor';
import {ExportControls} from '@/components/export-controls';
import {CropModal} from '@/components/crop-modal';
import {ThemeIndicator} from '@/components/theme-indicator';


export default async function HomePage() {
  const t = await getTranslations('Home');
  const tu = await getTranslations('Uploader');

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground max-w-prose">{t('description')}</p>
      </div>

      <ThemeIndicator />

      <div className="flex items-center gap-4">
        <Counter label={t('counter')} />
        <div className="flex gap-2">
          <Button variant="default" size="sm" data-testid="primary-btn">
            Primary
          </Button>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="outline" size="sm">
            Outline
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{tu('title')}</h2>
        <ImageUploadDropzone />
        <PreviewGrid />
        <ImageEditor />
        <ExportControls />
      </div>

      <CropModal />
    </section>
  );
}

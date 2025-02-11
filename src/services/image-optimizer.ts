import sharp from 'sharp';
import { handleError } from '../utils/error-handler';

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

class ImageOptimizer {
  private readonly defaultOptions: Required<ImageOptions> = {
    width: 800,
    height: 600,
    quality: 80,
    format: 'webp',
  };

  async optimize(
    input: Buffer | string,
    options: ImageOptions = {}
  ): Promise<Buffer> {
    try {
      const { width, height, quality, format } = {
        ...this.defaultOptions,
        ...options,
      };

      let pipeline = sharp(input);

      // Redimensionar mantendo aspecto
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });

      // Converter formato
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality });
          break;
        case 'png':
          pipeline = pipeline.png({ quality });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality });
          break;
      }

      // Otimizações adicionais
      pipeline = pipeline
        .rotate() // Auto-rotação baseada em EXIF
        .withMetadata() // Preservar metadados importantes
        .sharpen(); // Leve sharpening

      return await pipeline.toBuffer();
    } catch (error) {
      handleError(error);
      throw new Error('Falha ao otimizar imagem');
    }
  }

  async generateResponsiveSet(
    input: Buffer | string
  ): Promise<{ [key: string]: Buffer }> {
    try {
      const sizes = {
        sm: { width: 640, height: 480 },
        md: { width: 768, height: 576 },
        lg: { width: 1024, height: 768 },
        xl: { width: 1280, height: 960 },
      };

      const formats = ['webp', 'avif'] as const;
      const results: { [key: string]: Buffer } = {};

      for (const [size, dimensions] of Object.entries(sizes)) {
        for (const format of formats) {
          const buffer = await this.optimize(input, {
            ...dimensions,
            format,
          });
          results[\`\${size}-\${format}\`] = buffer;
        }
      }

      return results;
    } catch (error) {
      handleError(error);
      throw new Error('Falha ao gerar conjunto responsivo');
    }
  }

  getSrcSet(urls: { [key: string]: string }): string {
    const entries = Object.entries(urls).map(([key, url]) => {
      const [size] = key.split('-');
      const width = {
        sm: '640w',
        md: '768w',
        lg: '1024w',
        xl: '1280w',
      }[size];
      return \`\${url} \${width}\`;
    });
    return entries.join(', ');
  }

  getPicture(urls: { [key: string]: string }, alt: string): string {
    const webp = Object.entries(urls)
      .filter(([key]) => key.includes('webp'))
      .map(([key, url]) => {
        const [size] = key.split('-');
        const width = {
          sm: '640',
          md: '768',
          lg: '1024',
          xl: '1280',
        }[size];
        return \`<source media="(min-width: \${width}px)" srcset="\${url}" type="image/webp">\`;
      })
      .join('\\n');

    const avif = Object.entries(urls)
      .filter(([key]) => key.includes('avif'))
      .map(([key, url]) => {
        const [size] = key.split('-');
        const width = {
          sm: '640',
          md: '768',
          lg: '1024',
          xl: '1280',
        }[size];
        return \`<source media="(min-width: \${width}px)" srcset="\${url}" type="image/avif">\`;
      })
      .join('\\n');

    const fallback = urls['lg-webp'];

    return \`
      <picture>
        \${avif}
        \${webp}
        <img src="\${fallback}" alt="\${alt}" loading="lazy">
      </picture>
    \`;
  }
}

export const imageOptimizer = new ImageOptimizer();

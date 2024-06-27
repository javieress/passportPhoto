import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PhotoGeneratorService } from './photo-generator.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-photo-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './photo-generator.component.html',
  styleUrl: './photo-generator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoGeneratorComponent {
  constructor(
    private photoGeneratorService: PhotoGeneratorService,
    private sanitizer: DomSanitizer
  ) {}

  imageSrc: SafeUrl | null = null;
  firstName: string = '';
  lastName: string = '';
  rut: string = '';

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Definimos las dimensiones de la imagen final (2.6 x 3.2 cm)
        const aspectRatio = 2.6 / 3.2;
        const canvasWidth = 260; // 2.6 cm en píxeles (a 100 píxeles por cm)
        const canvasHeight = Math.round(canvasWidth / aspectRatio);

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Si no se pudo obtener el contexto, no hacemos nada
        if (!ctx) {
          return;
        }
        // Dibujamos la imagen original
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight - canvasWidth / 4);

        // Dibujamos el fondo negro para el nombre, apellido y RUT
        ctx.fillStyle = '#000000';
        ctx.fillRect(
          0,
          canvasHeight - canvasWidth / 4,
          canvasWidth,
          canvasWidth / 4
        );

        // Escribimos el nombre centrado en la primera línea
        ctx.fillStyle = '#FFFFFF'; // Color del texto blanco
        const nameFontSize = this.getMaxFontSize(
          ctx,
          this.firstName,
          canvasWidth
        );
        ctx.font = `bold ${nameFontSize}px Arial`; // Tamaño de fuente ajustado
        ctx.textAlign = 'center';
        ctx.fillText(
          this.firstName,
          canvasWidth / 2,
          canvasHeight - canvasWidth / 6 - 2
        );

        // Escribimos el apellido centrado en la segunda línea
        const lastNameFontSize = this.getMaxFontSize(
          ctx,
          this.lastName,
          canvasWidth
        );
        ctx.font = `bold ${lastNameFontSize}px Arial`; // Tamaño de fuente ajustado
        ctx.fillText(
          this.lastName,
          canvasWidth / 2,
          canvasHeight - canvasWidth / 6 + nameFontSize
        );

        // Escribimos el RUT centrado en la tercera línea
        const rutFontSize = this.getMaxFontSize(ctx, this.rut, canvasWidth);
        ctx.font = `${rutFontSize}px Arial`; // Tamaño de fuente ajustado
        ctx.fillText(
          this.rut,
          canvasWidth / 2,
          canvasHeight - canvasWidth / 6 + nameFontSize + lastNameFontSize
        );

        // Convertimos el canvas a una URL segura
        const modifiedImage = canvas.toDataURL('image/png');
        this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(modifiedImage);
        console.log('modify ok');

        canvas.toBlob((blob) => {
          if (blob) {
            // Creamos un enlace para descargar el Blob
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'passport_photo.png';
            // Hacemos clic en el enlace para iniciar la descarga
            link.click();
          }
        }, 'image/png');
      };
    };

    reader.readAsDataURL(file);
  }

  getMaxFontSize(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): number {
    let fontSize = 20; // Tamaño de fuente inicial
    do {
      fontSize--;
      ctx.font = `${fontSize}px Arial`;
    } while (ctx.measureText(text).width > maxWidth - 20); // Dejamos un pequeño margen
    return fontSize;
  }

  downloadImage(imageDataUrl: string) {
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = 'passport-photo.png';
    link.click();
  }
}

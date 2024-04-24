import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PhotoGeneratorService {
  constructor() {}

  // a function that take a photo file, take it and modofy the 20px of bottom and change it to black and save it
  modifyPhoto(photo: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height + 20;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return;
          }
          ctx.drawImage(img, 0, 0);
          ctx.fillStyle = 'black';
          ctx.fillRect(0, img.height, img.width, 20);
          canvas.toBlob((blob) => {
            resolve(new File([blob!], photo.name, { type: 'image/png' }));
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(photo);
    });
  }
}

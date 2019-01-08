import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { of } from 'rxjs/observable/of';
import { Template } from 'app/core/market/api/template/template.model';
import { addData, removeData } from 'app/_test/core-test/market-test/template-test/image-test/mock-data';

@Injectable()
export class ImageMockService {

  constructor() { }

  add(templateId: number, dataURI: any) {
    return of(addData)
    // return this.market.uploadImage(templateId, dataURI);
  }

  remove(imageId: number) {
    return of(removeData)
  }

  public upload(template: Template, images: Array<any>): Promise<Template> {
    let nPicturesAdded = 0;
    let totalnPicturesAdded = images.length;
    return new Promise((resolve, reject) => {
      if (images.length) {
        images.map(picture => {
          this.add(template.id, picture).take(1).subscribe(res => {
            if (++nPicturesAdded === totalnPicturesAdded) {
              resolve(template);
            }
          }, error => {
            // at least we have some images uploaded and we are assuming it as resolving it as a success
            --totalnPicturesAdded;
          });

        });
      } else {
        resolve();
      }
    });
  }
}

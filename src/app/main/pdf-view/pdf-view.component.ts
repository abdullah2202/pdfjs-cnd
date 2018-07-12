import {Component, OnInit, Input} from '@angular/core';
import {PdfHandlerService} from '../../pdf-handler.service';
import { DomSanitizer } from '@angular/platform-browser';




@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.css']
})
export class PdfViewComponent implements OnInit {
  @Input() viewData;
  totalPages: number;
  pageNumber: number = 1;
  view = 'selectview';
  labelList = [];

  posX = 0;
  posY = 0;

  pdf: any;

  constructor(
    private pdfHandlerService: PdfHandlerService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.setInitialProof();
  }

  print(){
    if(this.view != 'printview'){
      this.view = 'printview';
    }else{
      this.view = '';
    }
    this.generateView(this.pageNumber);
  }

  setInitialProof() {
    this.pdfHandlerService.setPdfDocObjects(this.viewData[1]).then((pdf) => {
      this.pdf = pdf;
      this.totalPages = this.pdf.pdfInfo.numPages;
      this.generateView(this.pageNumber);
    });

  }

  showPDF(file){
    this.pdfHandlerService.setPdfDocObjects(file,true).then((pdf) => {
      this.pdf = pdf;
      this.totalPages = this.pdf.pdfInfo.numPages;
      this.generateView(this.pageNumber);
    });
  }

  generateView(pageNumber,addToList:boolean = false) {
    this.pdf.getPage(pageNumber).then((page) => {
      let scale = 1.5;
      let viewport = page.getViewport(scale);
      // let textLayerDiv: any = document.getElementById("page_1");
      let canvas: any = document.getElementById('main-canvas');
      let context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      let renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);

      if(addToList){
        this.cutLabel();
      }


      /* page.getTextContent().then(function (textContent) {

        let textLayer = new TextLayerBuilder({
          textLayerDiv: textLayerDiv,
          pageIndex: pageNumber - 1,
          viewport: viewport
        });
        textLayer.setTextContent(textContent);
        textLayer.render(20);
      }); */
    });
  }

  

  addAllLabels(){
    for(var i=0;i<this.totalPages;i++){
      this.generateView(this.pageNumber,true);
    }
  }

  /**
   * Add label
   */
  cutLabel(){
    /* var cropX=90;
    var cropY=550;
    var cropWidth=383;
    var cropHeight=266; */
    var cropX=135;
    var cropY=825;
    var cropWidth=575;
    var cropHeight=399;
    let canvas: any = document.getElementById('main-canvas');
    let crop_canvas: any = document.getElementById("second-canvas");
    let ctx1 = crop_canvas.getContext('2d');
    var list = '';

    crop_canvas.width = cropHeight;
    crop_canvas.height = cropWidth;
    
    // Translate to right
    ctx1.translate(cropHeight,0);

    // Rotate 90 Degrees
    ctx1.rotate(90 * Math.PI / 180);
    
    ctx1.drawImage(
      canvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Rotate 90 Degrees
    ctx1.rotate(-90 * Math.PI / 180);

    // Translate to right
    ctx1.translate(-cropHeight,0);

    

    crop_canvas.toBlob((blob) => {
      let URLObj = window.URL;
      var url = URLObj.createObjectURL(blob);
      this.labelList.push(this.sanitizer.bypassSecurityTrustUrl(url));

    });
  }

  showOnCrop(index){
    console.log(index);
    var cropHeight=266;
    let crop_canvas: any = document.getElementById("second-canvas");
    let ctx1 = crop_canvas.getContext('2d');
    let image = document.getElementById('label_'+index);
  
    // ctx1.imageSmoothingEnabled = false;
    ctx1.clearRect(0, 0, crop_canvas.width, crop_canvas.height);

    ctx1.drawImage(image, 0, 0);
  
  }

  removeFromList(index){
    console.log(index);
    this.labelList.splice(index,1);
  }


  uploadPDF(target: EventTarget){
    let files = target['target']['files'];
    let fileList = [];
    
    if(!files){
      console.log('No Files');
    }else{
      for(var i = 0; i < files.length; i++){
        var fileUrl = window.URL.createObjectURL(files[i]);
        fileList.push({
          'url' : fileUrl,
          'docID' : 'i'
        });
      }
    }

    this.showPDF(fileList[0]);

  }

  mouseOver(event: MouseEvent){
    this.posX = event.layerX;
    this.posY = event.layerY;
    // console.log(event);
  }

  changePagePrevious() {
    this.pageNumber = this.pageNumber - 1;
    if (this.pageNumber < 1) {
      this.pageNumber = 1;
    }
    else {
      this.generateView(this.pageNumber);
    }
  }

  changePageNext() {
    this.pageNumber = this.pageNumber + 1;

    if (this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages;
    }
    else {
      this.generateView(this.pageNumber);
    }
  }

}

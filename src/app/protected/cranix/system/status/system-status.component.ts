import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
//Own stuff
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { SystemService } from 'src/app/services/system.service';
import { LanguageService } from 'src/app/services/language.service';
import { SupportTicket } from 'src/app/shared/models/data-model';
import { ServiceStatus } from 'src/app/shared/models/server-models';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'cranix-system-status',
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.scss'],
})
export class SystemStatusComponent implements OnInit {

  mySupport = new SupportTicket();
  objectKeys: string[];
  systemStatus: any;
  servicesStatus: ServiceStatus[];
  series = [
    {
      type: 'pie',
      angleKey: 'count',
      labelKey: 'name'
    }
  ];

  constructor(
    public objectService: GenericObjectService,
    public languageService: LanguageService,
    public modalController: ModalController,
    public storage: Storage,
    public systemService: SystemService,
    public authService: AuthenticationService
  ) {
    this.systemService.initModule();
  }

  ngOnInit() {
    this.storage.get('System.Status.mySupport').then((val) => {
      let myTmp = JSON.parse(val);
      if (myTmp && myTmp.email) {
        this.mySupport = myTmp;
        this.mySupport['subject'] = "";
        this.mySupport['text'] = "";
      }
    });
    this.systemStatus = {};
    let subM = this.systemService.getStatus().subscribe(
      (val) => {
        this.systemStatus = {};
        this.objectKeys = Object.keys(val).sort();
        for (let key of Object.keys(val)) {
          this.systemStatus[key] = {
            legend: { enabled: false },
            autoSize: false,
            width: 250,
            height: 220,
            series: this.series,
            padding: {
              right: 40,
              left: 40
          }
          };
          if (key.startsWith("/dev")) {
            //Convert value into GB
            this.systemStatus[key]['data'] = []
            for( let a  of val[key] ) {
              this.systemStatus[key]['data'].push(
                {
                  name: a['name'],
                  count: a['count'] / 1048576
                }
              )
            }
            this.systemStatus[key]['header'] = key + " [GB]"
          } else {
            this.systemStatus[key]['data']  = val[key];
            this.systemStatus[key]['header'] = this.languageService.trans(key)
          }
        }

      },
      (err) => { console.log(err) },
      () => { subM.unsubscribe() });
  }


  update(ev: Event) {
    this.systemService.update()
  }

  restart(ev: Event) {
    this.systemService.restart()
  }
  shutDown(ev: Event) {
    this.systemService.shutDown()
   }

  async support(ev: Event) {
    delete this.mySupport.description;
    delete this.mySupport.regcode;
    delete this.mySupport.product;
    delete this.mySupport.company;
    delete this.mySupport.regcodeValidUntil;
    delete this.mySupport.status;
    delete this.mySupport.requestDate;
    delete this.mySupport.ticketno;
    delete this.mySupport.ticketResponseInfo;
    const modal = await this.modalController.create({
      component: CreateSupport,
      cssClass: 'big-modal',
      componentProps: {
        support: this.mySupport,
      },
      animated: true,
      showBackdrop: true
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        delete dataReturned.data.subject;
        delete dataReturned.data.text;
        console.log("Object was created or modified", dataReturned.data);
        this.storage.set('System.Status.mySupport', JSON.stringify(dataReturned.data));
      }
    });
    (await modal).present();
  }
}


@Component({
  selector: 'create-support-page',
  templateUrl: 'create-support.html'
})
export class CreateSupport implements OnInit {

  disabled: boolean = false;
  files = [];
  @Input() support
  constructor(
    public modalController: ModalController,
    public systemService: SystemService,
    public objectService: GenericObjectService
  ) { }

  ngOnInit() { }
  onFilesAdded(event) {
    this.files = event.target.files;
  }

  addAttachment() {
    console.log("addP")
    for (let file of this.files) {
      this.support.attachmentName = file.name;
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        let index = e.target.result.toString().indexOf("base64,") + 7;
        this.support.attachment = e.target.result.toString().substring(index);
      }
      fileReader.readAsDataURL(file);
    }
  }
  onSubmit() {
    console.log(this.support)
    this.systemService.createSupportRequest(this.support).subscribe(
      (val) => {
        this.objectService.responseMessage(val);
        this.modalController.dismiss("OK")
      }
    )
  };
}


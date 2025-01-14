import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
//Own module
import { AuthenticationService } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/language.service';
import { ObjectsEditComponent } from 'src/app/shared/objects-edit/objects-edit.component';
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Settings } from 'src/app/shared/models/server-models';

@Component({
  selector: 'cranix-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {

  roomName: string = "";
  fullName: string = "";
  instituteName: string = "";

  @Input() title: string;
  constructor(
    public authService: AuthenticationService,
    public alertController: AlertController,
    public storage: Storage,
    public translateService: LanguageService,
    public objectService: GenericObjectService,
    public modalConroller: ModalController,
    public utilService: UtilsService
  ) {
    this.fullName = authService.session.fullName;
    this.roomName = authService.session.roomName;
    this.instituteName = authService.session.instituteName;
  }

  ngOnInit() {
  }

  async logOut(ev: Event) {
    const alert = await this.alertController.create({
      header: this.translateService.trans('Confirm!'),
      message: this.translateService.trans('Do you realy want to logout?'),
      buttons: [
        {
          text: this.translateService.trans('Cancel'),
          role: 'cancel',
        }, {
          text: 'OK',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  async retirectToSettings(ev: Event) {
    let settings: Settings = this.authService.settings;
    if (this.authService.isMD()) {
      delete settings.agGridThema
      delete settings.rowHeight
      delete settings.rowMultiSelectWithClick
      delete settings.checkboxSelection
      delete settings.headerCheckboxSelection
    } else {
      delete settings.lineProPageMD
    }
    settings.lang = this.translateService.language.toUpperCase();
    const modal = await this.modalConroller.create({
      component: ObjectsEditComponent,
      cssClass: 'medium-modal',
      componentProps: {
        objectType: "settings",
        objectAction: "modify",
        object: settings
      },
      animated: true,
      showBackdrop: true
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        for (let key of Object.getOwnPropertyNames(dataReturned.data)) {
          this.authService.settings[key] = dataReturned.data[key]
        }
        this.storage.set("myCranixSettings", JSON.stringify(this.authService.settings));
        this.translateService.saveLanguage(this.authService.settings.lang);
        if (this.utilService.actMdList) {
          this.utilService.actMdList.ngOnInit();
        }
        this.authService.log("ToolbarComponent", "Settings was modified", this.authService.settings)
      }
    });
    (await modal).present();
  }

  reloadAllObjects() {
    this.objectService.okMessage(this.translateService.trans("Reloading all objects"))
    this.objectService.initialize(true)
  }
}

import { Component } from "@angular/core";

import { Platform, NavController } from "@ionic/angular";
import { Plugins } from "@capacitor/core";
import { ScreenOrientation } from "@ionic-native/screen-orientation/ngx";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private screenOrientation: ScreenOrientation
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      Plugins.SplashScreen.hide();
      Plugins.StatusBar.setBackgroundColor({ color: "#3171e0" });
    });
  }
}

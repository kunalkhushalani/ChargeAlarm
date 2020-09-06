import { Component, OnInit, AfterViewInit } from "@angular/core";
import { BatteryStatus } from "@ionic-native/battery-status/ngx";
import { SubSink } from "subsink";
import { Howl } from "howler";
import { Platform } from "@ionic/angular";
import { Plugins, LocalNotificationActionPerformed } from "@capacitor/core";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit, AfterViewInit {
  batteryLevel: number = 95;
  buttonType: string = "play";
  sub = new SubSink();
  backButtonSub = new SubSink();
  sound: Howl = new Howl({
    src: ["../../assets/ringtones/Oneplus.mp3"],
    loop: true,
  });
  constructor(
    private batteryStatus: BatteryStatus,
    private platform: Platform
  ) {}

  ngOnInit() {
    Plugins.LocalNotifications.registerActionTypes({
      types: [
        {
          id: "Monitor_Actions",
          actions: [{ id: "stop_monitor", title: "STOP" }],
        },
      ],
    });
  }

  ngAfterViewInit() {
    this.backButtonSub.add(
      this.platform.backButton.subscribe(() => {
        navigator["app"].exitApp();
      })
    );
  }

  /**
   * Toggles play/pause button
   */
  togglePlayPause(): void {
    if (this.buttonType === "play") {
      this.startMonitor();
    } else {
      this.stopMonitor();
    }
  }

  /**
   * Increments/decrements batteryLevel field
   * @param action whether to increase or to decrease
   */
  increaseDecreaseLevel(action: string): void {
    if (action === "add") {
      ++this.batteryLevel;
    } else {
      --this.batteryLevel;
    }
  }

  /**
   * Starts monitoring battery level change
   */
  startMonitor(): void {
    this.buttonType = "pause";
    this.notify();
    this.sub.add(
      this.batteryStatus.onChange().subscribe((status) => {
        if (
          status.isPlugged &&
          status.level === parseInt(this.batteryLevel.toString())
        ) {
          this.playRingtone();
        }
      })
    );
  }

  /**
   * Sends notification about alarm set
   */
  notify(): void {
    Plugins.LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: "Charge alarm is set",
          body:
            "We'll notify you when battery reaches " + this.batteryLevel + "%",
          actionTypeId: "Monitor_Actions",
        },
      ],
    });
    Plugins.LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (notificationAction: LocalNotificationActionPerformed) => {
        if (notificationAction.actionId === "stop_monitor") {
          this.stopMonitor();
          Plugins.App.exitApp();
        }
      }
    );
  }
  /**
   * Plays ringtone
   */
  playRingtone(): void {
    this.sound.play();
  }

  /**
   * Stops monitoring battery level
   */
  stopMonitor(): void {
    this.buttonType = "play";
    this.sub.unsubscribe();
    this.stopRingtone();
  }

  /**
   * Stops playing ringtone
   */
  stopRingtone(): void {
    this.sound.stop();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.backButtonSub.unsubscribe();
  }
}

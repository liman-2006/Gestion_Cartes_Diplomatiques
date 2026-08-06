export interface Parametres {
  seuilAlerteJours: number;
  notificationsEmailActivees: boolean;
  notificationsSmsActivees: boolean;
  emailNotification: string | null;
  telephoneNotification: string | null;
  dateModification: string | null;
}

export interface ParametresRequest {
  seuilAlerteJours: number;
  notificationsEmailActivees: boolean;
  notificationsSmsActivees: boolean;
  emailNotification: string | null;
  telephoneNotification: string | null;
}

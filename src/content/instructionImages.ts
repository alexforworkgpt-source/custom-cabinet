const instructionImageFiles: Record<string, string[]> = {
  'connect-android': [
    '01-open-connection.png',
    '02-auto-detection.png',
    '03-choose-platform.png',
    '04-continue-platform.png',
    '05-google-play.png',
    '06-add-subscription.png',
  ],
  'connect-ios': [
    '01-open-connection.png',
    '02-choose-platform.png',
    '03-continue-platform.png',
    '04-app-store.png',
    '05-add-subscription.png',
  ],
  'connect-windows': [
    '01-open-connection.png',
    '02-choose-platform.png',
    '03-continue-platform.png',
    '04-download.png',
    '05-add-subscription.png',
  ],
  'connect-macos': [
    '01-open-connection.png',
    '02-choose-platform.png',
    '03-continue-platform.png',
    '04-apple-silicon.png',
    '05-add-subscription.png',
  ],
  'connect-android-tv': [
    '01-open-connection.png',
    '02-choose-platform.png',
    '03-continue-platform.png',
    '04-google-play.png',
    '05-add-subscription.png',
  ],
  'connect-apple-tv': [
    '01-open-connection.png',
    '02-choose-platform.png',
    '03-continue-platform.png',
    '04-app-store.png',
    '05-add-subscription.png',
  ],
  'renew-subscription': [
    '01-open-management.png',
    '02-open-renewal.png',
    '03-choose-period.png',
    '04-continue-period.png',
    '05-device-count.png',
    '06-top-up-balance.png',
    '07-stop-before-payment-method.png',
  ],
  'manage-devices': ['01-open-management.png', '02-open-devices.png', '03-device-list.png'],
  'manage-subscription': [
    '01-open-management.png',
    '02-renew-entry.png',
    '03-autorenew.png',
    '04-additional.png',
    '05-dangerous-options.png',
  ],
  'delete-device': ['01-open-management.png', '02-open-devices.png', '03-remove-device.png'],
  'share-subscription': [
    'sender/01-copy-subscription-link.png',
    'sender/02-open-qr-code.png',
    'sender/03-show-qr-code.png',
    'recipient-android/01-install-happ.png',
    'recipient-android/02-import-from-clipboard.png',
    'recipient-android/03-open-qr-scanner.png',
    'recipient-android/04-allow-camera.png',
    'recipient-android/05-scan-qr.png',
    'recipient-android/06-subscription-added.png',
    'recipient-android/07-start-vpn.png',
    'recipient-android/08-allow-vpn.png',
    'recipient-android/09-vpn-connected.png',
  ],
  'balance-overview': [
    '01-open-balance.png',
    '02-top-up.png',
    '03-promo.png',
    '04-history.png',
    '05-stop-before-method.png',
  ],
  'secure-account': ['01-open-profile.png', '02-linked-accounts.png', '03-provider-status.png'],
};

const instructionImageHeights: Record<string, number> = {
  'balance-overview/01-open-balance.png': 1688,
  'balance-overview/02-top-up.png': 1688,
  'balance-overview/03-promo.png': 1688,
  'balance-overview/04-history.png': 1688,
  'balance-overview/05-stop-before-method.png': 1688,
  'connect-android-tv/01-open-connection.png': 1688,
  'connect-android-tv/02-choose-platform.png': 1688,
  'connect-android-tv/03-continue-platform.png': 1002,
  'connect-android-tv/04-google-play.png': 1688,
  'connect-android-tv/05-add-subscription.png': 1150,
  'connect-android/01-open-connection.png': 1688,
  'connect-android/02-auto-detection.png': 1002,
  'connect-android/03-choose-platform.png': 1688,
  'connect-android/04-continue-platform.png': 1002,
  'connect-android/05-google-play.png': 1256,
  'connect-android/06-add-subscription.png': 942,
  'connect-apple-tv/01-open-connection.png': 1688,
  'connect-apple-tv/02-choose-platform.png': 1688,
  'connect-apple-tv/03-continue-platform.png': 1002,
  'connect-apple-tv/04-app-store.png': 1108,
  'connect-apple-tv/05-add-subscription.png': 988,
  'connect-ios/01-open-connection.png': 1688,
  'connect-ios/02-choose-platform.png': 1688,
  'connect-ios/03-continue-platform.png': 1002,
  'connect-ios/04-app-store.png': 1062,
  'connect-ios/05-add-subscription.png': 988,
  'connect-macos/01-open-connection.png': 1688,
  'connect-macos/02-choose-platform.png': 1688,
  'connect-macos/03-continue-platform.png': 1002,
  'connect-macos/04-apple-silicon.png': 1212,
  'connect-macos/05-add-subscription.png': 988,
  'connect-windows/01-open-connection.png': 1688,
  'connect-windows/02-choose-platform.png': 1688,
  'connect-windows/03-continue-platform.png': 1688,
  'connect-windows/04-download.png': 1108,
  'connect-windows/05-add-subscription.png': 988,
  'delete-device/01-open-management.png': 1688,
  'delete-device/02-open-devices.png': 1008,
  'delete-device/03-remove-device.png': 858,
  'manage-devices/01-open-management.png': 1688,
  'manage-devices/02-open-devices.png': 1008,
  'manage-devices/03-device-list.png': 858,
  'manage-subscription/01-open-management.png': 1688,
  'manage-subscription/02-renew-entry.png': 1008,
  'manage-subscription/03-autorenew.png': 1008,
  'manage-subscription/04-additional.png': 1008,
  'manage-subscription/05-dangerous-options.png': 1688,
  'renew-subscription/01-open-management.png': 1688,
  'renew-subscription/02-open-renewal.png': 1008,
  'renew-subscription/03-choose-period.png': 1688,
  'renew-subscription/04-continue-period.png': 1688,
  'renew-subscription/05-device-count.png': 1688,
  'renew-subscription/06-top-up-balance.png': 1688,
  'renew-subscription/07-stop-before-payment-method.png': 1688,
  'secure-account/01-open-profile.png': 1688,
  'secure-account/02-linked-accounts.png': 1688,
  'secure-account/03-provider-status.png': 1688,
  'share-subscription/recipient-android/01-install-happ.png': 1733,
  'share-subscription/recipient-android/02-import-from-clipboard.png': 1733,
  'share-subscription/recipient-android/03-open-qr-scanner.png': 1733,
  'share-subscription/recipient-android/04-allow-camera.png': 1733,
  'share-subscription/recipient-android/05-scan-qr.png': 1733,
  'share-subscription/recipient-android/06-subscription-added.png': 1733,
  'share-subscription/recipient-android/07-start-vpn.png': 1733,
  'share-subscription/recipient-android/08-allow-vpn.png': 1733,
  'share-subscription/recipient-android/09-vpn-connected.png': 1733,
  'share-subscription/sender/01-copy-subscription-link.png': 1688,
  'share-subscription/sender/02-open-qr-code.png': 942,
  'share-subscription/sender/03-show-qr-code.png': 1688,
};

export interface InstructionImageData {
  src: string;
  width: 780;
  height: number;
}

export const getInstructionImageData = (
  slug: string,
  stepIndex: number,
): InstructionImageData | undefined => {
  const file = instructionImageFiles[slug]?.[stepIndex];
  if (!file) return undefined;

  const height = instructionImageHeights[`${slug}/${file}`];
  if (!height) return undefined;

  return {
    src: `/instructions/${slug}/${file}`,
    width: 780,
    height,
  };
};

export const getInstructionImage = (slug: string, stepIndex: number): string | undefined => {
  return getInstructionImageData(slug, stepIndex)?.src;
};

export const getInstructionImageAlt = (heading: string): string =>
  `${heading}: красная стрелка показывает нужный элемент`;

export const instructionImageCount = Object.values(instructionImageFiles).reduce(
  (total, files) => total + files.length,
  0,
);

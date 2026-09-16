import { Platform } from 'react-native';

// Lazy import keeps browser previews and devices without the native module usable.
export async function cancelEquipmentScan() {
  if (Platform.OS === 'web') return;
  try { const { default: manager } = await import('react-native-nfc-manager'); await manager.cancelTechnologyRequest(); } catch { /* Already closed. */ }
}

export async function scanEquipmentTag(): Promise<string> {
  if (Platform.OS === 'web') throw new Error('Open the installed PASSport app to scan equipment.');
  const { default: manager, NfcTech } = await import('react-native-nfc-manager');
  if (!(await manager.isSupported())) throw new Error('This phone does not support NFC.');
  await manager.start();
  if (Platform.OS === 'android' && !(await manager.isEnabled())) throw new Error('Enable NFC in your phone settings.');
  try {
    // Read the hardware UID, including blank NTAG chips, without reading/writing NDEF.
    await manager.requestTechnology(Platform.OS === 'ios' ? [NfcTech.MifareIOS, NfcTech.Iso15693IOS] : [NfcTech.NfcA, NfcTech.NfcV], { alertMessage: 'Hold your phone near the equipment tag.' });
    const tag = await manager.getTag();
    const id = tag?.id?.replace(/[:-]/g, '').toUpperCase();
    if (!id || !/^(?:[0-9A-F]{2}){4,16}$/.test(id)) throw new Error('This chip has no supported stable identifier. Try an NTAG213/215/216 tag.');
    return id;
  } finally { await manager.cancelTechnologyRequest().catch(() => undefined); }
}

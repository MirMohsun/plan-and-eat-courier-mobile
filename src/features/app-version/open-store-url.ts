import { Linking } from 'react-native';

export async function openStoreUrl(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return false;
  }

  try {
    await Linking.openURL(trimmed);
    return true;
  }
  catch {
    return false;
  }
}

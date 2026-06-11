import 'react-native-url-polyfill/auto';

import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

if (!extra.supabaseUrl || !extra.supabaseAnonKey) {
  throw new Error('Missing Supabase config in mobile/app.json (expo.extra.supabaseUrl / supabaseAnonKey)');
}

export const supabase = createClient(extra.supabaseUrl, extra.supabaseAnonKey);


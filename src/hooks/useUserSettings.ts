import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserSettings = <T extends Record<string, any>>(
  settingKey: string,
  defaultValue: T
) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setSettings(defaultValue);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('setting_value')
          .eq('user_id', user.id)
          .eq('setting_key', settingKey)
          .maybeSingle();

        if (error) {
          console.error('Error loading settings:', error);
          setSettings(defaultValue);
        } else if (data) {
          setSettings(data.setting_value as T);
        } else {
          setSettings(defaultValue);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, settingKey]);

  // Save settings to database
  const saveSettings = useCallback(async (newSettings: T) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: settingKey,
          setting_value: newSettings,
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) {
        console.error('Error saving settings:', error);
      } else {
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [user, settingKey]);

  return { settings, saveSettings, loading };
};


import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // أولاً: تعيين مستمع لتغييرات حالة المصادقة
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // ثم: جلب الجلسة الحالية بعد إنشاء المستمع
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session fetched:", session);
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // تنظيف الاشتراك عند إزالة المكون
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
};

import { useEffect, useState } from "react";
import { View, ActivityIndicator, Button } from "react-native";
import Account from "../../components/Account";
import { supabase } from "../../lib/supabase";
import ReceiptScannerButton from "../../components/Camera";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      const session = res.data.session;
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Account key={userId} userId={userId} email={email} />
      <ReceiptScannerButton 
        onDataExtracted={(data) => console.log(data)}
        onError={(error) => console.error(error)}
      />
    </View>
  );
}

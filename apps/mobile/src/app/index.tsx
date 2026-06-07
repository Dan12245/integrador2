import { useEffect, useState } from "react";
import { View } from "react-native";
import Account from "../components/Account";
import Auth from "../components/Auth";
import { supabase } from "../lib/supabase";

export default function App() {
   const [userId, setUserId] = useState<string | null>(null);
   const [email, setEmail] = useState<string | undefined>(undefined);

   useEffect(() => {
   // 1. Verificación inicial cuando la app carga por primera vez
   supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
         setUserId(session.user.id);
         setEmail(session.user.email);
      }
   });
   // 2. Escuchar cambios de estado (cuando el usuario inicia sesión o cierra sesión)
   const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
         if (session?.user) {
            // Obtenemos los datos directamente de la sesión proporcionada
            setUserId(session.user.id);
            setEmail(session.user.email);
         } else {
            // Si no hay sesión (ej. hizo logout), limpiamos los estados
            setUserId(null);
            setEmail(undefined);
         }
      },
   );
   // 3. Limpiar el listener cuando el componente se desmonte
   return () => {
    authListener.subscription.unsubscribe();
      };
   }, []);

   return (
      <View>
         {userId ? (
          <Account key={userId} userId={userId} email={email} />
         ) : (
            <Auth />
         )}
      </View>
   );
}
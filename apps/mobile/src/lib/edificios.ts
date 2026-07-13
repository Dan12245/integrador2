import { supabase } from "./supabase";

//aca pues obviamente añadimos el edificio no?
export const addBuilding = async (alias:string, contractNumber:string, address:string, description:string) => 
    {  
        // Le pedimos a supabase que se traiga la sesion
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            console.log("Error: You are not loged");
            return;
        }

        // Juntamos la wea para mandarla a hono y q hono se la pase a supabase
        const TestBuilding = {
            profile_id: userId,
            alias: alias,
            contract_number: contractNumber,
            address: address,
            description: description
        };

        // Y le mandamos la wea a hono
        try 
        {
            console.log("Package ready to be sent:", TestBuilding);
                
            // Aca tenemos q poner la ip del server, osea la pc, en este caso es la mia NO DOXXEN HIJOS DE LA LANZA CAMOTES
            const answer = await fetch('http://:8787/addBuilding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TestBuilding)
            });
            // Checamos q el server nos ande pelando
            if (!answer.ok) {
                const answerData = await answer.json();
                console.log("Couldn't connect to the server, status:", answer.status, "Razon: ",answerData);
                return false;
            }
            // Si todó jalo desempacamos el JSON
            const answerData = await answer.json();
            console.log("Building added correctly:", answerData);
            return true;

            
        } catch (error) 
        {
            // Ps...todos sabemos q hace un catch no?
            console.log("Connection error", error);
            return false;
        }
    };
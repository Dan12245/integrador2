import { supabase } from "./supabase";

// Esta es la forma de un edificio TAL COMO viene de la base de datos.
// Los nombres de estos campos tienen que ser exactamente los de las
// columnas de la tabla 'buildings' en Supabase.
export type BuildingRecord = {
    id: number;
    profile_id: string;
    alias: string;
    contract_number: string;
    address: string;
    description: string;
    created_at: string;
    lat: number;
    longitude: number;
};

//aca pues obviamente añadimos el edificio no?
export const addBuilding = async (
    alias: string,
    contractNumber: string,
    address: string,
    description: string,
    lat: number,
    long: number
) => {
    // Le pedimos a supabase que se traiga la sesion
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
        console.log("Error: You are not loged");
        return;
    }

    try {
        //la wea ya no ocupa las coordenandas de aca, se las saca al proton asi directo jdsjad
        const TestBuilding = {
            profile_id: userId,
            alias: alias,
            contract_number: contractNumber,
            address: address, // Guardamos el texto
            description: description,
            lat: lat,
            long: long,
        };

        // Y le mandamos la wea a hono la linea de aca abajo nomas es debug 
        //console.log("Package ready to be sent:", TestBuilding);

        // Aca tenemos q poner la ip del server, osea la pc, en este caso es la mia NO DOXXEN HIJOS DE LA LANZA CAMOTES
        const answer = await fetch("http://192.168.0.15:8787/addBuilding", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(TestBuilding),
        });
        // Checamos q el server nos ande pelando
        if (!answer.ok) {
            const answerData = await answer.json();
            console.log(
                "Couldn't connect to the server, status:",
                answer.status,
                "Reasson: ",
                answerData,
            );
            return false;
        }
        // Si todó jalo desempacamos el JSON
        const answerData = await answer.json();
        console.log("Building added correctly:", answerData);
        return true;
    } catch (error) {
        // Ps...todos sabemos q hace un catch no?
        console.log("Connection error", error);
        return false;
    }
};

//aca traemos los edificios del usuario q este logueado
export const getBuildings = async (): Promise<BuildingRecord[] | null> => {
    // le sacamos la sesion
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
        console.log("Error: You are not loged");
        return null;
    }

    try {
        const answer = await fetch(
            `http://192.168.0.15:8787/myBuildings?profile_id=${userId}`
        );

        if (!answer.ok) {
            const answerData = await answer.json();
            console.log(
                "Couldn't fetch buildings, status:",
                answer.status,
                "Reasson: ",
                answerData,
            );
            return null;
        }

        const answerData = await answer.json();

        if (!answerData.ok) {
            console.log("Backend returned an error:", answerData.message);
            return null;
        }

        //console.log("Buildings fetched correctly:", answerData.data);
        return answerData.data as BuildingRecord[];
    } catch (error) {
        console.log("Connection error", error);
        return null;
    }
};

//funcion para borrar edificio
export const deleteBuilding = async (id:number) => {
    try{
        const url =`http://192.168.0.15:8787/${id}`

        const response = await fetch (url,{
            method: 'DELETE',
            headers:{
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
        throw new Error(`Error while deleting. Status: ${response.status}`);
        }

        // 4. Si todo salió bien, sacas la respuesta
        const data = await response.json();
        console.log('Building deleted:', data);
        
        return true;  
    } catch (error) {
        console.error('Error at deleteBuilding:', error);
        return false;
    }
}

export const editBuilding = async (
    id:number,
    alias:string,
    description:string
    ) => {
        try{
            const response = await fetch(`http://192.168.0.15:8787/${id}`, {
                method: 'PUT', // Le decimos que es actualización
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({    
                    alias: alias,
                    description: description    
                })    
            });    
            if (!response.ok) {
                throw new Error(`Error while editing. Status: ${response.status}`);    
            }

            const data = await response.json();
            console.log('Building edited:', data);                    
            return true;  
        }catch (error){
            console.error('Error at deleteBuilding:', error);
            return false;
        }   
}
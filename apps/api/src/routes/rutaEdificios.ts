import {Hono} from  'hono';
import { createClient } from '@supabase/supabase-js';

//nos traemos las weas de entorno
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_KEY: string
}

//hacemos una instancia de hono para que nos sirva de router y le pasamos sus credenciales para q no truene
const routerBuilding = new Hono<{Bindings: Bindings}> ();


//aca hacemos la ruta de la api para que se ponga a chambear la desgraciada
routerBuilding.post('/', async (c) => {

    if (!c.env.SUPABASE_URL) {
    return c.json({
      alert: "Hono isn't reading the .dev.vars file",
      data: c.env 
    }, 400)
  }
    //desenpaquetamos el JSON con los datos
    const body = await c.req.json();

    if (!body.profile_id || !body.alias){
        return c.json({
            ok:false,
            alert: "A field wasn't complete", 
        }, 400)
    };
  
    // iniciamos la conexion con supabase
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    //y le mandamos toda la info, que en este caso está hardcodeada de momento, a la DB
    //olvidenlo ya no esta hardcodeada LET'S GOOOOOO
    const { data, error } = await supabase
    .from('buildings') 
    .insert([
      {
        profile_id: body.profile_id,
        alias: body.alias,
        contract_number: body.contract_number,
        address: body.address,
        description: body.description
      }
    ])
    //y le decimos que le haga un Select para q se traiga la info para que se creen el created_at y el id_building
    .select()

    //aca nomas es validar para ver si tronó o neh
    if (error) {        
        return c.json({ 
            ok: false, 
            message: 'Error while savin in the database', 
            error }, 500)
  }

  return c.json({ 
    ok: true, 
    message: 'YA BUILDING WAS STORED, FELLA', 
    data 
  })
})

export default routerBuilding
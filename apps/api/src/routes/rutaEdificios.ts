import {Hono} from  'hono';
import { createClient } from '@supabase/supabase-js';

//nos traemos las weas de entorno
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_KEY: string
  USER_EMAIL: string
}

//hacemos una instancia de hono para que nos sirva de router y le pasamos sus credenciales para q no truene
const routerBuilding = new Hono<{Bindings: Bindings}> ();


//aca hacemos la ruta de la api para que se ponga a chambear la desgraciada
routerBuilding.post('/addBuilding', async (c) => {

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
    console.log("lo q le cae al hono pq mugre direccion nomas no aparece la maleducada\n",body)
    const { data, error } = await supabase
    .from('buildings') 
    .insert([
      {
        profile_id: body.profile_id,
        alias: body.alias,
        contract_number: body.contract_number,
        address: body.address,
        description: body.description,
        lat: body.lat,
        longitude: body.long
      }
    ])
    //y le decimos que le haga un Select para q se traiga la info para que se creen el created_at y el id_building
    .select()

    //aca nomas es validar para ver si tronó o neh
    if (error) {        
      return c.json({ 
          ok: false, 
          message: 'Error while saving in the database', 
          error 
        },
        500)
    }

  return c.json({ 
    ok: true, 
    message: 'YA BUILDING WAS STORED, FELLA', 
    data 
  })
})

//ruta para eliminar edificios
routerBuilding.delete('/:id', async (c)=>{
  if (!c.env.SUPABASE_URL) {
    return c.json({
      alert: "Hono isn't reading the .dev.vars file",
      data: c.env 
    }, 400)
  }
  //leemos el id que viene en la url
  const idString = c.req.param('id');
  const id = parseInt(idString, 10);

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  //y le hacemos la query a supabase
  const {data,error} = await supabase
    .from('buildings')
    .delete()
    .eq('id',id)

  if (error) {        
    return c.json({ 
        ok: false, 
        message: 'Error while trying to delete the building', 
        error 
      },
      500)
  }

  return c.json({ 
    ok: true, 
    message: 'YA BUILDING WAS DELETED, FELLA', 
    data 
  })
})

//funcion para editar edificios
routerBuilding.put('/:id', async (c) => {
  if (!c.env.SUPABASE_URL) {
    return c.json({
      alert: "Hono isn't reading the .dev.vars file",
      data: c.env 
    }, 400)
  }
  //leemos el id que viene en la url
  const idString = c.req.param('id');
  const id = parseInt(idString, 10);
  const body = await c.req.json();

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  //y le hacemos la query a supabase
  const {data,error} = await supabase
    .from('buildings')
    .update(body)
    .eq('id',id)
    .select();
  if (error) {        
    return c.json({ 
        ok: false, 
        message: 'Error while trying to edit the building', 
        error 
      },
      500)
  }

  return c.json({ 
    ok: true, 
    message: 'YA BUILDING WAS EDITED, FELLA', 
    data 
  })
    
})


//funcion para buscar la localizacion del lugar
routerBuilding.get('/searchBuilding', async (c) => {
  const address = c.req.query('q')

  if (!address) {
    return c.json({ error: 'The address wasnt provided' }, 400)
  }

  //le hablamos a la api de openstreet y le pasamos la direccion q tiene q guardar
  try {
    const answer = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          //aca tenemos q poner un correo pq si no nos bloquean el acceso, tons, aguas con eso
          'User-Agent': `CRA/1.0 (${c.env.USER_EMAIL})`
        }
      }
    )

    const data = await answer.json()

    if (data && data.length > 0) {
      const result = {
        officialName: data[0].display_name,
        lat: parseFloat(data[0].lat),
        long: parseFloat(data[0].lon)
      }
      return c.json(result)
    } else {
      return c.json({ error: 'Building couldnt be found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'connection problem' }, 500)
  }
})

//esta wea es para hacer un autocompletado de las direcciones
routerBuilding.get('/autocomplete', async (c) => {
  const query = c.req.query('q')

  if (!query) {
    return c.json([]) // Si no hay texto, regresamos un arreglo vacío
  }

  try {
    const respuesta = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
    )
    const data = await respuesta.json()
    
    if (data.features) {
      return c.json(data.features)
    } else {
      return c.json([])
    }
  } catch (error) {
    return c.json([], 500) // Si falla, regresamos vacío para no crashear la app
  }
})

//funcion para sacar la direccion a partir de coordenadas (reverse geocoding)
routerBuilding.get('/reverseGeocode', async (c) => {
  const lat = c.req.query('lat')
  const lon = c.req.query('lon')

  if (!lat || !lon) {
    return c.json({ error: 'lat y lon are required' }, 400)
  }

  try {
    //le hablamos a nomnatim para pedirle la lat y long si el usuario lo selecciona directo en el mapa en lugar de poner la wea con la ubicacion
    const answer = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'User-Agent': `CRA/1.0 (${c.env.USER_EMAIL})`
        }
      }
    )

    const data = await answer.json()

    if (data && data.display_name) {
      return c.json({
        address: data.display_name,
        lat: parseFloat(data.lat),
        long: parseFloat(data.lon)
      })
    } else {
      return c.json({ error: 'address wasnt found' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'connection problem' }, 500)
  }
})

//ruta para listar los edificios, esta sencilla, nomas es un get que pregunta que edificios tiene este usuario y se los trae
routerBuilding.get('/myBuildings', async (c) => {
  const profileId = c.req.query('profile_id')
  if (!profileId) {
    return c.json({ ok: false, error: 'profile_id is required' }, 400)
  }
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  const { data, error } = await supabase
    .from('buildings')
    //el select asi vacio siginifica select *, es la misma wea
    .select()
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) {
    return c.json({ ok: false, message: 'Error while loading buildings', error }, 500)
  }
  return c.json({ ok: true, data })
})


export default routerBuilding